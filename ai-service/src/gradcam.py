import argparse
import json
from pathlib import Path

import cv2
import numpy as np
import tensorflow as tf
from tensorflow import keras

from src.predict import (
    load_registry,
    predict_image,
    prepare_image,
    resolve_input_image,
)
from src.resnet50_model import (
    get_resnet50_base,
)
from src.utils import CLASS_NAMES, PROJECT_ROOT


DEFAULT_LAST_CONV_LAYER = "conv5_block3_out"


def generate_resnet50_gradcam(
    model: keras.Model,
    processed_batch: np.ndarray,
    target_label_id: int,
    last_conv_layer_name: str = DEFAULT_LAST_CONV_LAYER,
) -> np.ndarray:
    """Generate a ResNet50 Grad-CAM heatmap dynamically supporting any classification head."""
    base_model = get_resnet50_base(model)

    try:
        last_conv_layer = base_model.get_layer(
            last_conv_layer_name
        )
    except ValueError as error:
        raise ValueError(
            f"Last convolution layer not found: "
            f"{last_conv_layer_name}"
        ) from error

    model_cls = type(base_model)
    feature_probe = model_cls(
        inputs=base_model.input,
        outputs=[
            last_conv_layer.output,
            base_model.output,
        ],
    )

    with tf.GradientTape() as tape:
        conv_outputs, features = feature_probe(
            processed_batch,
            training=False,
        )

        x = features

        # Dynamically pass feature outputs through all layers after base model
        found_base = False
        for layer in model.layers:
            if not found_base:
                if layer.name == base_model.name or "resnet" in layer.name.lower():
                    found_base = True
                continue

            layer_cls_name = type(layer).__name__
            if "BatchNormalization" in layer_cls_name or "Dropout" in layer_cls_name:
                x = layer(
                    x,
                    training=False,
                )
            else:
                x = layer(x)

        malignant_score = x[:, 0]

        if target_label_id == 1:
            target_score = malignant_score
        else:
            target_score = (
                1.0 - malignant_score
            )

    gradients = tape.gradient(
        target_score,
        conv_outputs,
    )

    if gradients is None:
        raise RuntimeError(
            "Grad-CAM gradients could not be calculated."
        )

    pooled_gradients = tf.reduce_mean(
        gradients,
        axis=(0, 1, 2),
    )

    conv_outputs = conv_outputs[0]

    heatmap = tf.reduce_sum(
        conv_outputs
        * pooled_gradients,
        axis=-1,
    )

    heatmap = tf.maximum(
        heatmap,
        0,
    )

    maximum = tf.reduce_max(
        heatmap
    )

    if float(maximum) > 0:
        heatmap = heatmap / maximum

    return heatmap.numpy()

def save_gradcam_images(
    image_path: Path,
    heatmap: np.ndarray,
    output_directory: Path,
    alpha: float = 0.40,
) -> tuple[Path, Path]:
    """Save raw heatmap and image overlay."""
    output_directory.mkdir(
        parents=True,
        exist_ok=True,
    )

    original_bgr = cv2.imread(
        str(image_path),
        cv2.IMREAD_COLOR,
    )

    if original_bgr is None:
        raise ValueError(
            f"OpenCV could not read image: {image_path}"
        )

    image_height, image_width = (
        original_bgr.shape[:2]
    )

    heatmap_resized = cv2.resize(
        heatmap,
        (
            image_width,
            image_height,
        ),
    )

    heatmap_uint8 = np.uint8(
        255 * heatmap_resized
    )

    coloured_heatmap = cv2.applyColorMap(
        heatmap_uint8,
        cv2.COLORMAP_JET,
    )

    overlay = cv2.addWeighted(
        original_bgr,
        1.0 - alpha,
        coloured_heatmap,
        alpha,
        0,
    )

    heatmap_path = (
        output_directory
        / f"{image_path.stem}_heatmap.png"
    )

    overlay_path = (
        output_directory
        / f"{image_path.stem}_gradcam.png"
    )

    cv2.imwrite(
        str(heatmap_path),
        coloured_heatmap,
    )

    cv2.imwrite(
        str(overlay_path),
        overlay,
    )

    return heatmap_path, overlay_path


def parse_arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Generate Grad-CAM for the selected ResNet50 model."
        )
    )

    parser.add_argument(
        "--image",
        required=True,
        help="Path to an input image.",
    )

    parser.add_argument(
        "--output-dir",
        default="outputs/predictions/gradcam",
        help="Directory for Grad-CAM outputs.",
    )

    parser.add_argument(
        "--target",
        choices=[
            "predicted",
            "benign",
            "malignant",
        ],
        default="predicted",
    )

    parser.add_argument(
        "--alpha",
        type=float,
        default=0.40,
    )

    return parser.parse_args()


def main() -> None:
    arguments = parse_arguments()

    if not 0.0 <= arguments.alpha <= 1.0:
        raise ValueError(
            "Alpha must be between 0 and 1."
        )

    registry = load_registry()

    if (
        registry["preprocessing_mode"].lower()
        != "resnet50"
    ):
        raise ValueError(
            "This Grad-CAM implementation expects "
            "the selected ResNet50 model."
        )

    image_path = resolve_input_image(
        arguments.image
    )

    result, model = predict_image(
        image_path=image_path,
        registry=registry,
    )

    _, processed_batch = prepare_image(
        image_path=image_path,
        registry=registry,
    )

    if arguments.target == "predicted":
        target_label_id = int(
            result["predicted_label_id"]
        )
    elif arguments.target == "malignant":
        target_label_id = 1
    else:
        target_label_id = 0

    heatmap = generate_resnet50_gradcam(
        model=model,
        processed_batch=processed_batch,
        target_label_id=target_label_id,
    )

    output_directory = (
        PROJECT_ROOT
        / arguments.output_dir
    ).resolve()

    heatmap_path, overlay_path = (
        save_gradcam_images(
            image_path=image_path,
            heatmap=heatmap,
            output_directory=output_directory,
            alpha=arguments.alpha,
        )
    )

    summary = {
        "image_path": str(image_path),
        "model_name": result["model_name"],
        "predicted_label": result[
            "predicted_label"
        ],
        "confidence": result["confidence"],
        "gradcam_target": CLASS_NAMES[
            target_label_id
        ],
        "heatmap_path": str(heatmap_path),
        "overlay_path": str(overlay_path),
    }

    summary_path = (
        output_directory
        / f"{image_path.stem}_gradcam.json"
    )

    summary_path.write_text(
        json.dumps(summary, indent=4),
        encoding="utf-8",
    )

    print("=" * 68)
    print("PATHOVISION GRAD-CAM")
    print("=" * 68)
    print(
        f"Prediction : "
        f"{result['predicted_label'].upper()}"
    )
    print(
        f"Confidence : "
        f"{result['confidence'] * 100:.2f}%"
    )
    print(
        f"CAM target : "
        f"{CLASS_NAMES[target_label_id].upper()}"
    )
    print(f"Heatmap    : {heatmap_path}")
    print(f"Overlay    : {overlay_path}")
    print(f"Summary    : {summary_path}")


if __name__ == "__main__":
    main()

