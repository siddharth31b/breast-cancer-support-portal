from collections.abc import Callable

import tensorflow as tf
from tensorflow import keras


def build_augmentation_model(
    seed: int = 42,
) -> keras.Sequential:
    """Build controlled training augmentation."""
    return keras.Sequential(
        [
            keras.layers.RandomFlip(
                mode="horizontal",
                seed=seed,
                name="random_horizontal_flip",
            ),
            keras.layers.RandomRotation(
                factor=0.05,
                fill_mode="reflect",
                seed=seed + 1,
                name="random_rotation",
            ),
            keras.layers.RandomZoom(
                height_factor=(-0.10, 0.10),
                width_factor=(-0.10, 0.10),
                fill_mode="reflect",
                seed=seed + 2,
                name="random_zoom",
            ),
            keras.layers.RandomTranslation(
                height_factor=0.05,
                width_factor=0.05,
                fill_mode="reflect",
                seed=seed + 3,
                name="random_translation",
            ),
            keras.layers.RandomContrast(
                factor=0.10,
                seed=seed + 4,
                name="random_contrast",
            ),
        ],
        name="training_augmentation",
    )


def decode_and_resize_image(
    image_path: tf.Tensor,
    image_height: int,
    image_width: int,
) -> tf.Tensor:
    """Read, decode and resize an RGB image."""
    image_bytes = tf.io.read_file(image_path)

    image = tf.io.decode_image(
        image_bytes,
        channels=3,
        expand_animations=False,
    )

    image.set_shape(
        [
            None,
            None,
            3,
        ]
    )

    image = tf.image.resize(
        image,
        size=[
            image_height,
            image_width,
        ],
        method=tf.image.ResizeMethod.BILINEAR,
        antialias=True,
    )

    return tf.cast(
        image,
        tf.float32,
    )


def preprocess_for_model(
    image: tf.Tensor,
    preprocessing_mode: str = "resnet50",
) -> tf.Tensor:
    """Apply official ResNet50 preprocessing."""
    if preprocessing_mode.lower() != "resnet50":
        raise ValueError(
            "Only ResNet50 preprocessing is supported."
        )

    return tf.keras.applications.resnet50.preprocess_input(
        image
    )


def create_preprocessing_function(
    image_height: int,
    image_width: int,
    training: bool,
    preprocessing_mode: str = "resnet50",
    seed: int = 42,
) -> Callable:
    """Create a TensorFlow dataset mapping function."""
    if preprocessing_mode.lower() != "resnet50":
        raise ValueError(
            "Only ResNet50 preprocessing is supported."
        )

    augmentation_model = (
        build_augmentation_model(seed)
        if training
        else None
    )

    def preprocess(
        image_path: tf.Tensor,
        label: tf.Tensor,
    ) -> tuple[tf.Tensor, tf.Tensor]:
        image = decode_and_resize_image(
            image_path=image_path,
            image_height=image_height,
            image_width=image_width,
        )

        if augmentation_model is not None:
            image = augmentation_model(
                image,
                training=True,
            )

            image = tf.clip_by_value(
                image,
                0.0,
                255.0,
            )

        image = preprocess_for_model(
            image=image,
            preprocessing_mode="resnet50",
        )

        label = tf.cast(
            label,
            tf.float32,
        )

        return image, label

    return preprocess
