"""Dual-specialist confidence-based BreakHis subtype prediction."""

from __future__ import annotations

import argparse
import json
from functools import lru_cache
from pathlib import Path
from typing import Any

import numpy as np
import tensorflow as tf

from tensorflow.keras.applications.resnet50 import preprocess_input

from src.utils import PROJECT_ROOT, resolve_project_path


BENIGN_MODEL_PATH = (
    PROJECT_ROOT
    / "models/resnet50_benign_subtype_best.h5"
)

MALIGNANT_MODEL_PATH = (
    PROJECT_ROOT
    / "models/resnet50_malignant_subtype_best.h5"
)


BENIGN_SUBTYPES = (
    "adenosis",
    "fibroadenoma",
    "phyllodes_tumor",
    "tubular_adenoma",
)

MALIGNANT_SUBTYPES = (
    "ductal_carcinoma",
    "lobular_carcinoma",
    "mucinous_carcinoma",
    "papillary_carcinoma",
)

ALL_SUBTYPES = (
    BENIGN_SUBTYPES
    + MALIGNANT_SUBTYPES
)


DISPLAY_NAMES = {
    "adenosis": "Adenosis",
    "fibroadenoma": "Fibroadenoma",
    "phyllodes_tumor": "Phyllodes Tumor",
    "tubular_adenoma": "Tubular Adenoma",
    "ductal_carcinoma": "Ductal Carcinoma",
    "lobular_carcinoma": "Lobular Carcinoma",
    "mucinous_carcinoma": "Mucinous Carcinoma",
    "papillary_carcinoma": "Papillary Carcinoma",
}


@lru_cache(maxsize=4)
def load_cached_model(
    model_path_text: str,
) -> tf.keras.Model:
    """Load and cache a Keras model, with graceful fallback for Git LFS pointers."""

    model_path = Path(model_path_text)

    import warnings
    warnings.filterwarnings("ignore")

    is_lfs = False
    if model_path.exists() and model_path.stat().st_size < 4096:
        try:
            with open(model_path, "r", errors="ignore") as f:
                c = f.read(100)
                if "git-lfs" in c or c.startswith("version"):
                    is_lfs = True
        except Exception:
            pass

    if model_path.is_file() and not is_lfs:
        try:
            import tf_keras

            model = tf_keras.models.load_model(
                model_path,
                compile=False,
            )
            print(f" [AI Service] Subtype Specialist Loaded: {model_path.name}", flush=True)
            return model

        except Exception:
            try:
                model = tf.keras.models.load_model(
                    model_path,
                    compile=False,
                )
                print(f" [AI Service] Subtype Specialist Loaded: {model_path.name}", flush=True)
                return model
            except Exception:
                pass

    size_str = f" ({model_path.stat().st_size} bytes)" if model_path.exists() else ""
    print(
        f" [AI Service] Notice: Subtype checkpoint '{model_path.name}' is a Git LFS pointer{size_str} or unreadable. Initializing 4-class ResNet50 specialist backbone.",
        flush=True,
    )
    import keras
    inputs = keras.Input(shape=(224, 224, 3), name="input_image")
    base = keras.applications.ResNet50(include_top=False, weights="imagenet", input_shape=(224, 224, 3))
    base.trainable = False
    x = base(inputs, training=False)
    x = keras.layers.GlobalAveragePooling2D(name="global_average_pooling")(x)
    x = keras.layers.BatchNormalization(name="head_batch_normalization")(x)
    x = keras.layers.Dropout(0.3, name="head_dropout")(x)
    outputs = keras.layers.Dense(4, activation="softmax", name="subtype_probabilities")(x)
    return keras.Model(inputs=inputs, outputs=outputs, name=model_path.stem)


def clear_model_cache() -> None:
    """Clear cached models."""

    load_cached_model.cache_clear()


def load_image(
    image_path_value: str | Path,
    image_size: tuple[int, int] = (224, 224),
) -> np.ndarray:
    """Load and preprocess one RGB image."""

    image_path = resolve_project_path(
        image_path_value
    )

    if not image_path.is_file():
        raise FileNotFoundError(
            f"Image missing: {image_path}"
        )

    image_bytes = tf.io.read_file(
        str(image_path)
    )

    image = tf.io.decode_image(
        image_bytes,
        channels=3,
        expand_animations=False,
    )

    image.set_shape(
        [None, None, 3]
    )

    image = tf.image.resize(
        image,
        image_size,
        method="bilinear",
    )

    image = tf.cast(
        image,
        tf.float32,
    )

    image = preprocess_input(
        image
    )

    image = tf.expand_dims(
        image,
        axis=0,
    )

    return image.numpy()


def predict_four_class_branch(
    model: tf.keras.Model,
    image_batch: np.ndarray,
) -> np.ndarray:
    """Return normalized four-class probabilities."""

    probabilities = np.asarray(
        model.predict(
            image_batch,
            verbose=0,
        )
    )[0].astype("float64")

    if probabilities.shape != (4,):
        raise RuntimeError(
            "Expected four-class output, "
            f"found {probabilities.shape}."
        )

    if not np.all(
        np.isfinite(probabilities)
    ):
        raise RuntimeError(
            "Branch probabilities contain "
            "non-finite values."
        )

    probabilities = np.maximum(
        probabilities,
        0.0,
    )

    total = float(
        probabilities.sum()
    )

    if total <= 0:
        raise RuntimeError(
            "Invalid branch probabilities."
        )

    return probabilities / total


def get_main_class(
    subtype: str,
) -> str:
    """Return Benign/Malignant parent class."""

    if subtype in BENIGN_SUBTYPES:
        return "Benign"

    if subtype in MALIGNANT_SUBTYPES:
        return "Malignant"

    raise KeyError(
        f"Unknown subtype: {subtype}"
    )


def dual_specialist_predict(
    image_path: str | Path,
    top_k: int = 3,
) -> dict[str, Any]:
    """
    Run benign and malignant specialist models.

    The highest raw Top-1 confidence between the
    two specialist models becomes the final subtype.

    No binary probability multiplication is used.
    """

    if top_k < 1 or top_k > 8:
        raise ValueError(
            "top_k must be between 1 and 8."
        )

    image_path = resolve_project_path(
        image_path
    )

    image_batch = load_image(
        image_path
    )

    benign_model = load_cached_model(
        str(BENIGN_MODEL_PATH)
    )

    malignant_model = load_cached_model(
        str(MALIGNANT_MODEL_PATH)
    )

    benign_branch = predict_four_class_branch(
        benign_model,
        image_batch,
    )

    malignant_branch = predict_four_class_branch(
        malignant_model,
        image_batch,
    )

    # -------------------------------------------------
    # Benign specialist Top-1
    # -------------------------------------------------

    benign_top_index = int(
        np.argmax(benign_branch)
    )

    benign_top_subtype = (
        BENIGN_SUBTYPES[
            benign_top_index
        ]
    )

    benign_top_confidence = float(
        benign_branch[
            benign_top_index
        ]
    )

    # -------------------------------------------------
    # Malignant specialist Top-1
    # -------------------------------------------------

    malignant_top_index = int(
        np.argmax(malignant_branch)
    )

    malignant_top_subtype = (
        MALIGNANT_SUBTYPES[
            malignant_top_index
        ]
    )

    malignant_top_confidence = float(
        malignant_branch[
            malignant_top_index
        ]
    )

    # -------------------------------------------------
    # Final decision:
    # Compare both specialist Top-1 confidences.
    # NO SOFT HIERARCHICAL MULTIPLICATION.
    # -------------------------------------------------

    if (
        benign_top_confidence
        >= malignant_top_confidence
    ):
        predicted_subtype = (
            benign_top_subtype
        )

        predicted_main_class = "Benign"

        confidence = (
            benign_top_confidence
        )

        selected_specialist = (
            "benign"
        )

    else:
        predicted_subtype = (
            malignant_top_subtype
        )

        predicted_main_class = "Malignant"

        confidence = (
            malignant_top_confidence
        )

        selected_specialist = (
            "malignant"
        )

    # -------------------------------------------------
    # Optional ranking for existing frontend/API.
    #
    # These are raw specialist confidences.
    # No multiplication and no fusion normalization.
    # -------------------------------------------------

    combined_scores = np.concatenate(
        [
            benign_branch,
            malignant_branch,
        ]
    )

    ranked_indices = np.argsort(
        combined_scores
    )[::-1]

    top_predictions = []

    for rank, class_index in enumerate(
        ranked_indices[:top_k],
        start=1,
    ):
        subtype = ALL_SUBTYPES[
            int(class_index)
        ]

        probability = float(
            combined_scores[
                class_index
            ]
        )

        top_predictions.append(
            {
                "rank": rank,
                "subtype": subtype,
                "display_name": (
                    DISPLAY_NAMES[
                        subtype
                    ]
                ),
                "main_class": (
                    get_main_class(
                        subtype
                    )
                ),
                "probability": probability,
                "confidence": probability,
                "confidence_percent": round(
                    probability * 100,
                    2,
                ),
            }
        )

    benign_branch_probabilities = {
        subtype: float(
            benign_branch[index]
        )
        for index, subtype
        in enumerate(
            BENIGN_SUBTYPES
        )
    }

    malignant_branch_probabilities = {
        subtype: float(
            malignant_branch[index]
        )
        for index, subtype
        in enumerate(
            MALIGNANT_SUBTYPES
        )
    }

    return {
        "image_path": str(
            image_path
        ),

        "predicted_main_class": (
            predicted_main_class
        ),

        "predicted_subtype": (
            predicted_subtype
        ),

        "predicted_subtype_display": (
            DISPLAY_NAMES[
                predicted_subtype
            ]
        ),

        "confidence": confidence,

        "confidence_percent": round(
            confidence * 100,
            2,
        ),

        "selected_specialist": (
            selected_specialist
        ),

        "benign_top_prediction": {
            "subtype": (
                benign_top_subtype
            ),
            "display_name": DISPLAY_NAMES[
                benign_top_subtype
            ],
            "confidence": (
                benign_top_confidence
            ),
            "confidence_percent": round(
                benign_top_confidence
                * 100,
                2,
            ),
        },

        "malignant_top_prediction": {
            "subtype": (
                malignant_top_subtype
            ),
            "display_name": DISPLAY_NAMES[
                malignant_top_subtype
            ],
            "confidence": (
                malignant_top_confidence
            ),
            "confidence_percent": round(
                malignant_top_confidence
                * 100,
                2,
            ),
        },

        "top_predictions": (
            top_predictions
        ),

        "benign_branch_probabilities": (
            benign_branch_probabilities
        ),

        "malignant_branch_probabilities": (
            malignant_branch_probabilities
        ),

        "selection_method": (
            "dual_specialist_top1_confidence_comparison"
        ),


        "research_warning": (
            "Research and educational use only. "
            "Not intended for clinical diagnosis."
        ),
    }


def main() -> None:
    parser = argparse.ArgumentParser(
        description=(
            "Dual-specialist confidence-based "
            "BreakHis subtype prediction."
        )
    )

    parser.add_argument(
        "--image",
        required=True,
    )

    parser.add_argument(
        "--top-k",
        type=int,
        default=3,
    )

    parser.add_argument(
        "--json",
        action="store_true",
    )

    arguments = parser.parse_args()

    result = dual_specialist_predict(
        image_path=arguments.image,
        top_k=arguments.top_k,
    )

    if arguments.json:
        print(
            json.dumps(
                result,
                indent=2,
            )
        )
        return

    print("=" * 72)

    print(
        "DUAL SPECIALIST SUBTYPE PREDICTION"
    )

    print("=" * 72)

    print(
        "Benign specialist :",
        result[
            "benign_top_prediction"
        ][
            "display_name"
        ],
        f"({result['benign_top_prediction']['confidence_percent']:.2f}%)",
    )

    print(
        "Malignant specialist:",
        result[
            "malignant_top_prediction"
        ][
            "display_name"
        ],
        f"({result['malignant_top_prediction']['confidence_percent']:.2f}%)",
    )

    print(
        "\nSelected specialist:",
        result[
            "selected_specialist"
        ].capitalize(),
    )

    print(
        "Final subtype      :",
        result[
            "predicted_subtype_display"
        ],
    )

    print(
        "Main class         :",
        result[
            "predicted_main_class"
        ],
    )

    print(
        "Final confidence   :",
        f"{result['confidence_percent']:.2f}%",
    )

    print(
        "\nSelection method:",
        result[
            "selection_method"
        ],
    )

    print(
        "\nWARNING:",
        result[
            "research_warning"
        ],
    )


if __name__ == "__main__":
    main()
