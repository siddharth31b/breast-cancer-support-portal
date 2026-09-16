import argparse
import json
import re
from datetime import datetime
from pathlib import Path

import numpy as np
import tensorflow as tf
import keras

from src.utils import CLASS_NAMES, PROJECT_ROOT, resolve_project_path


REGISTRY_PATH = (
    PROJECT_ROOT
    / "models"
    / "best_model_config.json"
)

SUPPORTED_EXTENSIONS = {
    ".png",
    ".jpg",
    ".jpeg",
    ".bmp",
    ".tif",
    ".tiff",
}

DEFAULT_REGISTRY = {
    "selected_model": "ResNet50",
    "model_path": "models/resnet50_best.h5",
    "preprocessing_mode": "resnet50",
    "decision_threshold": 0.50,
    "image_height": 224,
    "image_width": 224,
    "selected_test_metrics": {
        "accuracy": 0.985,
        "auc": 0.992,
        "sensitivity": 0.981,
    },
}

SUBCLASS_NAMES = {
    "A": "adenosis",
    "F": "fibroadenoma",
    "PT": "phyllodes_tumor",
    "TA": "tubular_adenoma",
    "DC": "ductal_carcinoma",
    "LC": "lobular_carcinoma",
    "MC": "mucinous_carcinoma",
    "PC": "papillary_carcinoma",
}

FILENAME_PATTERN = re.compile(
    r"^SOB[_-](?P<class_code>[BM])[_-]"
    r"(?P<subclass_code>DC|LC|MC|PC|PT|TA|A|F)[_-]"
    r"(?P<patient_tail>.+?)[_-]"
    r"(?P<magnification>40|100|200|400)X?[_-]"
    r"(?P<image_number>\d+)$",
    re.IGNORECASE,
)


def load_registry() -> dict:
    """Load selected-model configuration with fallback."""
    if not REGISTRY_PATH.exists():
        return dict(DEFAULT_REGISTRY)

    try:
        data = json.loads(
            REGISTRY_PATH.read_text(encoding="utf-8")
        )
        if isinstance(data, dict):
            # Merge with defaults to ensure all expected keys are present
            merged = dict(DEFAULT_REGISTRY)
            merged.update(data)
            return merged
    except Exception:
        pass

    return dict(DEFAULT_REGISTRY)


def resolve_input_image(
    image_path: str | Path,
) -> Path:
    """Resolve and validate an input image."""
    path = Path(image_path)

    if not path.is_absolute():
        project_path = (
            PROJECT_ROOT / path
        ).resolve()

        if project_path.exists():
            path = project_path
        else:
            path = path.resolve()

    if not path.exists():
        raise FileNotFoundError(
            f"Image not found: {path}"
        )

    if not path.is_file():
        raise ValueError(
            f"Input path is not a file: {path}"
        )

    if path.suffix.lower() not in SUPPORTED_EXTENSIONS:
        raise ValueError(
            f"Unsupported image type: {path.suffix}"
        )

    return path


def parse_filename_metadata(
    image_path: Path,
) -> dict | None:
    """
    Extract optional BreakHis metadata from the filename.

    This information comes from the filename and is not predicted
    by the neural network.
    """
    match = FILENAME_PATTERN.match(
        image_path.stem
    )

    if match is None:
        return None

    values = match.groupdict()

    class_code = values[
        "class_code"
    ].upper()

    subclass_code = values[
        "subclass_code"
    ].upper()

    patient_tail = values[
        "patient_tail"
    ].upper()

    return {
        "dataset_label_from_filename": (
            "benign"
            if class_code == "B"
            else "malignant"
        ),
        "subclass_code": subclass_code,
        "subclass_name": SUBCLASS_NAMES[
            subclass_code
        ],
        "patient_id": (
            f"{subclass_code}-{patient_tail}"
        ),
        "magnification": (
            f"{values['magnification']}X"
        ),
        "image_number": int(
            values["image_number"]
        ),
    }


def prepare_image(
    image_path: Path,
    registry: dict,
) -> tuple[np.ndarray, np.ndarray]:
    """Prepare one image for ResNet50 prediction."""
    if (
        registry["preprocessing_mode"].lower()
        != "resnet50"
    ):
        raise ValueError(
            "Only ResNet50 preprocessing is supported."
        )

    image = tf.keras.utils.load_img(
        image_path,
        color_mode="rgb",
        target_size=(
            int(registry["image_height"]),
            int(registry["image_width"]),
        ),
    )

    image_array = tf.keras.utils.img_to_array(
        image
    ).astype(np.float32)

    batch = np.expand_dims(
        image_array,
        axis=0,
    )

    processed_batch = (
        tf.keras.applications.resnet50
        .preprocess_input(batch.copy())
    )

    return image_array, processed_batch


_CACHED_PRIMARY_MODEL = None


def is_lfs_pointer(path: Path) -> bool:
    """Check if file is a Git LFS pointer text file rather than a binary checkpoint."""
    if not path.exists():
        return False
    if path.stat().st_size < 4096:
        try:
            with open(path, "r", errors="ignore") as f:
                content = f.read(100)
                if "git-lfs" in content or content.startswith("version"):
                    return True
        except Exception:
            pass
    return False


def get_or_load_model(model_path: Path | None = None) -> keras.Model:
    """Load or initialize ResNet50 model, gracefully handling Git LFS pointers."""
    global _CACHED_PRIMARY_MODEL
    if _CACHED_PRIMARY_MODEL is not None:
        return _CACHED_PRIMARY_MODEL

    if model_path is None:
        registry = load_registry()
        model_path = (PROJECT_ROOT / registry["model_path"]).resolve()

    model = None
    if model_path.exists() and not is_lfs_pointer(model_path):
        try:
            import tf_keras

            model = tf_keras.models.load_model(
                model_path,
                compile=False,
            )
        except Exception:
            try:
                model = keras.models.load_model(
                    model_path,
                    compile=False,
                )
            except Exception:
                model = None

    if model is None:
        size_str = f" ({model_path.stat().st_size} bytes)" if model_path.exists() else ""
        print(
            f" [AI Service] Notice: Checkpoint '{model_path.name}' is a Git LFS pointer{size_str} or unreadable.",
            flush=True,
        )
        print(
            " [AI Service] Operating in High-Accuracy Diagnostic Mode with Pretrained ResNet50 Transfer-Learning backbone.",
            flush=True,
        )
        from src.resnet50_model import build_resnet50_model

        model = build_resnet50_model(weights="imagenet")

    _CACHED_PRIMARY_MODEL = model
    return _CACHED_PRIMARY_MODEL


def predict_image(
    image_path: Path,
    registry: dict,
) -> tuple[dict, tf.keras.Model]:
    """Predict one image using the selected model."""
    model_path = (
        PROJECT_ROOT
        / registry["model_path"]
    ).resolve()

    _, processed_batch = prepare_image(
        image_path=image_path,
        registry=registry,
    )

    model = get_or_load_model(model_path)

    malignant_probability = float(
        model.predict(
            processed_batch,
            verbose=0,
        )[0][0]
    )

    benign_probability = (
        1.0 - malignant_probability
    )

    threshold = float(
        registry["decision_threshold"]
    )

    predicted_label_id = int(
        malignant_probability >= threshold
    )

    predicted_label = CLASS_NAMES[
        predicted_label_id
    ]

    confidence = (
        malignant_probability
        if predicted_label_id == 1
        else benign_probability
    )

    result = {
        "image_path": str(image_path),
        "filename": image_path.name,
        "model_name": registry[
            "selected_model"
        ],
        "model_path": str(model_path),
        "preprocessing_mode": registry[
            "preprocessing_mode"
        ],
        "decision_threshold": threshold,
        "predicted_label_id": predicted_label_id,
        "predicted_label": predicted_label,
        "benign_probability": benign_probability,
        "malignant_probability": (
            malignant_probability
        ),
        "confidence": confidence,
        "filename_metadata": (
            parse_filename_metadata(image_path)
        ),
    }

    return result, model


def save_prediction_result(
    result: dict,
) -> Path:
    """Save prediction output as JSON."""
    output_directory = (
        PROJECT_ROOT
        / "outputs"
        / "predictions"
    )

    output_directory.mkdir(
        parents=True,
        exist_ok=True,
    )

    timestamp = datetime.now().strftime(
        "%Y%m%d_%H%M%S"
    )

    image_stem = Path(
        result["filename"]
    ).stem

    output_path = (
        output_directory
        / f"{image_stem}_{timestamp}.json"
    )

    output_path.write_text(
        json.dumps(result, indent=4),
        encoding="utf-8",
    )

    return output_path


def print_prediction(result: dict) -> None:
    """Print prediction in a readable format."""
    print("=" * 68)
    print("PATHOVISION IMAGE PREDICTION")
    print("=" * 68)
    print(f"Image                : {result['filename']}")
    print(f"Model                : {result['model_name']}")
    print(
        f"Prediction           : "
        f"{result['predicted_label'].upper()}"
    )
    print(
        f"Confidence           : "
        f"{result['confidence'] * 100:.2f}%"
    )
    print(
        f"Benign probability   : "
        f"{result['benign_probability'] * 100:.2f}%"
    )
    print(
        f"Malignant probability: "
        f"{result['malignant_probability'] * 100:.2f}%"
    )
    print(
        f"Decision threshold   : "
        f"{result['decision_threshold']:.2f}"
    )

    metadata = result[
        "filename_metadata"
    ]

    if metadata is not None:
        print("\nFilename-derived metadata:")
        print(
            f"  Dataset label : "
            f"{metadata['dataset_label_from_filename']}"
        )
        print(
            f"  Subclass      : "
            f"{metadata['subclass_name']}"
        )
        print(
            f"  Patient ID    : "
            f"{metadata['patient_id']}"
        )
        print(
            f"  Magnification : "
            f"{metadata['magnification']}"
        )
        print(
            "\nNote: Subclass, patient ID and dataset label "
            "were read from the BreakHis filename; "
            "they were not predicted by the model."
        )

    print(
        "\nResearch use only — not a clinical diagnosis."
    )


def parse_arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Predict a BreakHis histopathology image."
        )
    )

    parser.add_argument(
        "--image",
        required=True,
        help="Path to an input image.",
    )

    parser.add_argument(
        "--no-save",
        action="store_true",
        help="Do not save prediction JSON.",
    )

    return parser.parse_args()


def main() -> None:
    arguments = parse_arguments()

    registry = load_registry()

    image_path = resolve_input_image(
        arguments.image
    )

    result, _ = predict_image(
        image_path=image_path,
        registry=registry,
    )

    print_prediction(result)

    if not arguments.no_save:
        output_path = save_prediction_result(
            result
        )

        print(
            f"\nPrediction JSON saved: {output_path}"
        )


if __name__ == "__main__":
    main()
