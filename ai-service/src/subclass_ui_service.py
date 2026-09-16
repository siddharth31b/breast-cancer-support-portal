"""UI-facing service for dual-specialist BreakHis subtype prediction."""

from __future__ import annotations

from pathlib import Path
from typing import Any

from src.dual_specialist_predictor import (
    BENIGN_SUBTYPES,
    DISPLAY_NAMES,
    dual_specialist_predict,
    get_main_class,
)


RESEARCH_WARNING = (
    "This subtype prediction is intended for research and "
    "educational use only, not for clinical diagnosis."
)


def normalize_main_class(
    class_name: str | None,
) -> str | None:
    """Normalize a binary class name for comparison."""

    if class_name is None:
        return None

    normalized = str(
        class_name
    ).strip().lower()

    if normalized == "benign":
        return "Benign"

    if normalized == "malignant":
        return "Malignant"

    return str(
        class_name
    ).strip()


def normalize_subclass_label(
    value: str | None,
) -> str | None:
    """Normalize subtype names for comparison."""

    if value is None:
        return None

    normalized = (
        str(value)
        .strip()
        .lower()
        .replace("-", "_")
        .replace(" ", "_")
    )

    return normalized or None


def confidence_percentage(
    confidence: float,
) -> float:
    """Convert probability/confidence to percentage."""

    return round(
        float(confidence) * 100.0,
        2,
    )


def subtype_main_class(
    subtype: str | None,
) -> str | None:
    """Derive Benign/Malignant parent from subtype."""

    normalized = normalize_subclass_label(
        subtype
    )

    if normalized is None:
        return None

    try:
        return get_main_class(
            normalized
        )

    except KeyError:
        return None


def create_subclass_ui_result(
    image_path: str | Path,
    top_k: int = 3,
    verify_hash: bool = False,
) -> dict[str, Any]:
    """
    Run dual-specialist prediction and adapt its
    output to the existing Flask/UI contract.

    No binary probability multiplication is used.
    """

    # Kept only for compatibility with existing app.py.
    _ = verify_hash

    prediction = dual_specialist_predict(
        image_path=image_path,
        top_k=top_k,
    )

    predicted_subclass = prediction.get(
        "predicted_subtype"
    )

    predicted_display = (
        prediction.get(
            "predicted_subtype_display"
        )
        or DISPLAY_NAMES.get(
            predicted_subclass,
            predicted_subclass,
        )
    )

    predicted_main_class = (
        prediction.get(
            "predicted_main_class"
        )
        or subtype_main_class(
            predicted_subclass
        )
    )

    confidence = float(
        prediction.get(
            "confidence",
            0.0,
        )
    )

    top_predictions = []

    for rank, item in enumerate(
        prediction.get(
            "top_predictions",
            [],
        ),
        start=1,
    ):
        subtype = (
            item.get("subtype")
            or item.get(
                "predicted_subtype"
            )
        )

        display_name = (
            item.get("display_name")
            or DISPLAY_NAMES.get(
                subtype,
                subtype,
            )
        )

        main_class = (
            item.get("main_class")
            or subtype_main_class(
                subtype
            )
        )

        item_confidence = float(
            item.get(
                "confidence",
                item.get(
                    "probability",
                    0.0,
                ),
            )
        )

        top_predictions.append(
            {
                "rank": int(
                    item.get(
                        "rank",
                        rank,
                    )
                ),
                "subclass": subtype,
                "display_name": display_name,
                "main_class": main_class,
                "confidence": item_confidence,
                "confidence_percent": (
                    confidence_percentage(
                        item_confidence
                    )
                ),
            }
        )

    selection_method = prediction.get(
        "selection_method",
        "dual_specialist_top1_confidence_comparison",
    )

    return {
        "available": True,

        "prediction_method": (
            "dual_specialist_resnet50"
        ),

        "main_class": (
            predicted_main_class
        ),

        "subclass": (
            predicted_subclass
        ),

        "subclass_display": (
            predicted_display
        ),

        "confidence": confidence,

        "confidence_percent": (
            confidence_percentage(
                confidence
            )
        ),

        "selected_specialist": (
            prediction.get(
                "selected_specialist"
            )
        ),

        "benign_top_prediction": (
            prediction.get(
                "benign_top_prediction"
            )
        ),

        "malignant_top_prediction": (
            prediction.get(
                "malignant_top_prediction"
            )
        ),

        "top_predictions": (
            top_predictions
        ),

        "selection_method": (
            selection_method
        ),

        # Temporary compatibility for current app.py.
        # app.py will be cleaned in the next phase.

        "model_hash_status": (
            "dual_specialist_model_set"
        ),

        "warning": (
            prediction.get(
                "research_warning"
            )
            or RESEARCH_WARNING
        ),

        "error": None,
    }


def create_safe_subclass_ui_result(
    image_path: str | Path,
    top_k: int = 3,
    verify_hash: bool = False,
) -> dict[str, Any]:
    """Return UI-safe result even if prediction fails."""

    try:
        return create_subclass_ui_result(
            image_path=image_path,
            top_k=top_k,
            verify_hash=verify_hash,
        )

    except Exception as error:
        return {
            "available": False,

            "prediction_method": (
                "dual_specialist_resnet50"
            ),

            "main_class": None,
            "subclass": None,
            "subclass_display": None,
            "confidence": None,
            "confidence_percent": None,

            "selected_specialist": None,

            "benign_top_prediction": None,

            "malignant_top_prediction": None,

            "top_predictions": [],

            "selection_method": (
                "dual_specialist_top1_confidence_comparison"
            ),


            "model_hash_status": None,

            "warning": RESEARCH_WARNING,

            "error": str(
                error
            ),
        }


def add_binary_agreement(
    subclass_result: dict[str, Any],
    binary_class: str | None,
) -> dict[str, Any]:
    """
    Compare the independent binary ResNet50 result with
    the parent class of the selected specialist subtype.

    Binary prediction does NOT control subtype selection.
    """

    result = dict(
        subclass_result
    )

    normalized_binary_class = (
        normalize_main_class(
            binary_class
        )
    )

    subtype_parent_class = (
        normalize_main_class(
            result.get(
                "main_class"
            )
        )
    )

    agreement: bool | None = None

    if (
        result.get("available")
        and normalized_binary_class
        and subtype_parent_class
    ):
        agreement = (
            normalized_binary_class
            == subtype_parent_class
        )

    result[
        "binary_class"
    ] = normalized_binary_class

    result[
        "binary_agreement"
    ] = agreement

    if agreement is True:
        message = (
            "Binary model and selected subtype "
            "parent class agree."
        )

    elif agreement is False:
        message = (
            "Binary model and selected subtype "
            "parent class differ."
        )

    else:
        message = None

    result[
        "binary_agreement_message"
    ] = message

    return result
