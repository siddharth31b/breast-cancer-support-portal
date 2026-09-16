from typing import Literal

import tensorflow as tf
from tensorflow import keras


WeightsType = Literal["imagenet"] | None


def get_resnet50_base(
    model: keras.Model,
) -> keras.Model:
    """
    Return the nested ResNet50 base model.

    Keras normally names the application model 'resnet50'.
    The additional fallback keeps saved models compatible.
    """
    possible_names = (
        "resnet50_base",
        "resnet50",
    )

    for layer_name in possible_names:
        try:
            layer = model.get_layer(layer_name)
        except ValueError:
            continue

        if hasattr(layer, "layers") or hasattr(layer, "get_layer"):
            return layer

    # Final fallback: find any nested model containing resnet50.
    for layer in model.layers:
        if (
            (hasattr(layer, "layers") or hasattr(layer, "get_layer"))
            and "resnet50" in layer.name.lower()
        ):
            return layer

    available_layers = [
        layer.name
        for layer in model.layers
    ]

    raise ValueError(
        "ResNet50 base model was not found. "
        f"Available layers: {available_layers}"
    )


def build_resnet50_model(
    image_height: int = 224,
    image_width: int = 224,
    channels: int = 3,
    weights: WeightsType = "imagenet",
) -> keras.Model:
    """
    Build a ResNet50 transfer-learning model.

    Output:
        0 -> Benign
        1 -> Malignant
    """
    inputs = keras.Input(
        shape=(
            image_height,
            image_width,
            channels,
        ),
        name="input_image",
    )

    base_model = keras.applications.ResNet50(
        include_top=False,
        weights=weights,
        input_shape=(
            image_height,
            image_width,
            channels,
        ),
    )

    # Stage 1: freeze complete ImageNet feature extractor.
    base_model.trainable = False

    x = base_model(
        inputs,
        training=False,
    )

    x = keras.layers.GlobalAveragePooling2D(
        name="global_average_pooling",
    )(x)

    x = keras.layers.BatchNormalization(
        name="head_batch_normalization",
    )(x)

    x = keras.layers.Dropout(
        rate=0.40,
        name="head_dropout_1",
    )(x)

    x = keras.layers.Dense(
        units=128,
        activation="relu",
        kernel_regularizer=keras.regularizers.l2(
            0.0001
        ),
        name="head_dense",
    )(x)

    x = keras.layers.Dropout(
        rate=0.30,
        name="head_dropout_2",
    )(x)

    outputs = keras.layers.Dense(
        units=1,
        activation="sigmoid",
        name="malignant_probability",
    )(x)

    return keras.Model(
        inputs=inputs,
        outputs=outputs,
        name="PathoVision_ResNet50",
    )


def compile_resnet50_model(
    model: keras.Model,
    learning_rate: float,
) -> keras.Model:
    """Compile ResNet50 for benign/malignant classification."""
    model.compile(
        optimizer=keras.optimizers.Adam(
            learning_rate=learning_rate,
        ),
        loss=keras.losses.BinaryCrossentropy(),
        metrics=[
            keras.metrics.BinaryAccuracy(
                name="accuracy",
            ),
            keras.metrics.Precision(
                name="precision",
            ),
            keras.metrics.Recall(
                name="sensitivity",
            ),
            keras.metrics.AUC(
                name="auc",
            ),
        ],
    )

    return model


def prepare_resnet50_fine_tuning(
    model: keras.Model,
    unfreeze_last_layers: int = 30,
) -> keras.Model:
    """
    Unfreeze the final ResNet50 layers.

    Batch-normalization layers remain frozen because the project
    uses a small batch size.
    """
    if unfreeze_last_layers <= 0:
        raise ValueError(
            "unfreeze_last_layers must be greater than zero."
        )

    base_model = get_resnet50_base(model)

    base_model.trainable = True

    # Freeze every base-model layer first.
    for layer in base_model.layers:
        layer.trainable = False

    # Unfreeze only the selected final layers.
    for layer in base_model.layers[
        -unfreeze_last_layers:
    ]:
        if isinstance(
            layer,
            keras.layers.BatchNormalization,
        ):
            layer.trainable = False
        else:
            layer.trainable = True

    trainable_base_layers = [
        layer.name
        for layer in base_model.layers
        if layer.trainable
    ]

    if not trainable_base_layers:
        raise RuntimeError(
            "No ResNet50 base layers were unfrozen."
        )

    return model


def count_trainable_parameters(
    model: keras.Model,
) -> int:
    """Count model trainable parameters."""
    return int(
        sum(
            tf.keras.backend.count_params(weight)
            for weight in model.trainable_weights
        )
    )
