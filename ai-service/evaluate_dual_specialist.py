"""Evaluate dual-specialist subtype selection on BreakHis test images."""

from __future__ import annotations

import csv
import json
import re
from pathlib import Path

import numpy as np
from sklearn.metrics import (
    accuracy_score,
    balanced_accuracy_score,
    confusion_matrix,
    precision_recall_fscore_support,
)

from src.dual_specialist_predictor import (
    BENIGN_MODEL_PATH,
    BENIGN_SUBTYPES,
    DISPLAY_NAMES,
    MALIGNANT_MODEL_PATH,
    MALIGNANT_SUBTYPES,
    load_cached_model,
    load_image,
)


TEST_ROOT = Path(
    r"C:\Users\siddh\Desktop\PathoVision_All_Test_Images"
)

OUTPUT_DIR = Path(
    "outputs/dual_specialist/final_test_1378"
)

BATCH_SIZE = 16

ALL_SUBTYPES = (
    BENIGN_SUBTYPES
    + MALIGNANT_SUBTYPES
)

FILENAME_CODE_TO_SUBTYPE = {
    "A": "adenosis",
    "F": "fibroadenoma",
    "PT": "phyllodes_tumor",
    "TA": "tubular_adenoma",
    "DC": "ductal_carcinoma",
    "LC": "lobular_carcinoma",
    "MC": "mucinous_carcinoma",
    "PC": "papillary_carcinoma",
}


def subtype_from_filename(
    filename: str,
) -> str:
    """Extract true BreakHis subtype from filename."""

    match = re.match(
        r"^SOB_[BM]_(A|F|PT|TA|DC|LC|MC|PC)-",
        filename,
        flags=re.IGNORECASE,
    )

    if match is None:
        raise ValueError(
            f"Cannot determine subtype from filename: {filename}"
        )

    code = match.group(1).upper()

    return FILENAME_CODE_TO_SUBTYPE[
        code
    ]


def main_class_from_subtype(
    subtype: str,
) -> str:
    if subtype in BENIGN_SUBTYPES:
        return "Benign"

    return "Malignant"


def normalize_rows(
    values: np.ndarray,
) -> np.ndarray:
    """Normalize model outputs into row-wise probabilities."""

    values = np.asarray(
        values,
        dtype=np.float64,
    )

    values = np.maximum(
        values,
        0.0,
    )

    totals = values.sum(
        axis=1,
        keepdims=True,
    )

    if np.any(totals <= 0):
        raise RuntimeError(
            "Model produced invalid probability rows."
        )

    return values / totals


def main() -> None:
    OUTPUT_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    image_paths = sorted(
        [
            path
            for path in TEST_ROOT.rglob("*")
            if path.is_file()
            and path.suffix.lower()
            in {".png", ".jpg", ".jpeg"}
        ]
    )

    if not image_paths:
        raise RuntimeError(
            f"No test images found in: {TEST_ROOT}"
        )

    print(
        "Total test images:",
        len(image_paths),
    )

    print(
        "Loading benign specialist..."
    )

    benign_model = load_cached_model(
        str(BENIGN_MODEL_PATH)
    )

    print(
        "Loading malignant specialist..."
    )

    malignant_model = load_cached_model(
        str(MALIGNANT_MODEL_PATH)
    )

    y_true: list[str] = []
    y_pred: list[str] = []

    prediction_rows: list[dict] = []

    total_batches = (
        len(image_paths)
        + BATCH_SIZE
        - 1
    ) // BATCH_SIZE

    for batch_number, start in enumerate(
        range(
            0,
            len(image_paths),
            BATCH_SIZE,
        ),
        start=1,
    ):
        batch_paths = image_paths[
            start:start + BATCH_SIZE
        ]

        image_batch = np.concatenate(
            [
                load_image(path)
                for path in batch_paths
            ],
            axis=0,
        )

        benign_outputs = normalize_rows(
            benign_model.predict(
                image_batch,
                verbose=0,
            )
        )

        malignant_outputs = normalize_rows(
            malignant_model.predict(
                image_batch,
                verbose=0,
            )
        )

        for index, image_path in enumerate(
            batch_paths
        ):
            true_subtype = subtype_from_filename(
                image_path.name
            )

            true_main_class = (
                main_class_from_subtype(
                    true_subtype
                )
            )

            benign_probs = (
                benign_outputs[index]
            )

            malignant_probs = (
                malignant_outputs[index]
            )

            benign_top_index = int(
                np.argmax(
                    benign_probs
                )
            )

            malignant_top_index = int(
                np.argmax(
                    malignant_probs
                )
            )

            benign_top_subtype = (
                BENIGN_SUBTYPES[
                    benign_top_index
                ]
            )

            malignant_top_subtype = (
                MALIGNANT_SUBTYPES[
                    malignant_top_index
                ]
            )

            benign_top_confidence = float(
                benign_probs[
                    benign_top_index
                ]
            )

            malignant_top_confidence = float(
                malignant_probs[
                    malignant_top_index
                ]
            )

            if (
                benign_top_confidence
                >= malignant_top_confidence
            ):
                predicted_subtype = (
                    benign_top_subtype
                )

                predicted_main_class = (
                    "Benign"
                )

                final_confidence = (
                    benign_top_confidence
                )

                selected_specialist = (
                    "benign"
                )

            else:
                predicted_subtype = (
                    malignant_top_subtype
                )

                predicted_main_class = (
                    "Malignant"
                )

                final_confidence = (
                    malignant_top_confidence
                )

                selected_specialist = (
                    "malignant"
                )

            y_true.append(
                true_subtype
            )

            y_pred.append(
                predicted_subtype
            )

            prediction_rows.append(
                {
                    "filename": (
                        image_path.name
                    ),
                    "image_path": str(
                        image_path
                    ),
                    "magnification": (
                        image_path.parent.name
                    ),
                    "true_main_class": (
                        true_main_class
                    ),
                    "true_subtype": (
                        true_subtype
                    ),
                    "true_subtype_display": (
                        DISPLAY_NAMES[
                            true_subtype
                        ]
                    ),
                    "benign_top_subtype": (
                        benign_top_subtype
                    ),
                    "benign_top_confidence": (
                        benign_top_confidence
                    ),
                    "malignant_top_subtype": (
                        malignant_top_subtype
                    ),
                    "malignant_top_confidence": (
                        malignant_top_confidence
                    ),
                    "selected_specialist": (
                        selected_specialist
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
                    "final_confidence": (
                        final_confidence
                    ),
                    "correct": (
                        predicted_subtype
                        == true_subtype
                    ),
                }
            )

        print(
            f"Batch {batch_number}/{total_batches} complete "
            f"({min(start + BATCH_SIZE, len(image_paths))}"
            f"/{len(image_paths)})"
        )

    accuracy = accuracy_score(
        y_true,
        y_pred,
    )

    balanced_accuracy = (
        balanced_accuracy_score(
            y_true,
            y_pred,
        )
    )

    (
        per_precision,
        per_recall,
        per_f1,
        per_support,
    ) = precision_recall_fscore_support(
        y_true,
        y_pred,
        labels=list(
            ALL_SUBTYPES
        ),
        zero_division=0,
    )

    (
        macro_precision,
        macro_recall,
        macro_f1,
        _,
    ) = precision_recall_fscore_support(
        y_true,
        y_pred,
        average="macro",
        zero_division=0,
    )

    (
        weighted_precision,
        weighted_recall,
        weighted_f1,
        _,
    ) = precision_recall_fscore_support(
        y_true,
        y_pred,
        average="weighted",
        zero_division=0,
    )

    cm = confusion_matrix(
        y_true,
        y_pred,
        labels=list(
            ALL_SUBTYPES
        ),
    )

    metrics = {
        "evaluation_method": (
            "dual_specialist_top1_confidence_comparison"
        ),
        "test_root": str(
            TEST_ROOT
        ),
        "total_images": len(
            image_paths
        ),
        "accuracy": float(
            accuracy
        ),
        "accuracy_percent": round(
            accuracy * 100,
            2,
        ),
        "balanced_accuracy": float(
            balanced_accuracy
        ),
        "balanced_accuracy_percent": round(
            balanced_accuracy * 100,
            2,
        ),
        "macro_precision": float(
            macro_precision
        ),
        "macro_recall": float(
            macro_recall
        ),
        "macro_f1": float(
            macro_f1
        ),
        "macro_f1_percent": round(
            macro_f1 * 100,
            2,
        ),
        "weighted_precision": float(
            weighted_precision
        ),
        "weighted_recall": float(
            weighted_recall
        ),
        "weighted_f1": float(
            weighted_f1
        ),
        "weighted_f1_percent": round(
            weighted_f1 * 100,
            2,
        ),
    }

    (
        OUTPUT_DIR
        / "metrics.json"
    ).write_text(
        json.dumps(
            metrics,
            indent=4,
        ),
        encoding="utf-8",
    )

    with (
        OUTPUT_DIR
        / "test_predictions.csv"
    ).open(
        "w",
        newline="",
        encoding="utf-8",
    ) as file:
        writer = csv.DictWriter(
            file,
            fieldnames=list(
                prediction_rows[
                    0
                ].keys()
            ),
        )

        writer.writeheader()

        writer.writerows(
            prediction_rows
        )

    with (
        OUTPUT_DIR
        / "per_subtype_metrics.csv"
    ).open(
        "w",
        newline="",
        encoding="utf-8",
    ) as file:
        fieldnames = [
            "subtype",
            "display_name",
            "precision",
            "recall",
            "f1",
            "support",
        ]

        writer = csv.DictWriter(
            file,
            fieldnames=fieldnames,
        )

        writer.writeheader()

        for index, subtype in enumerate(
            ALL_SUBTYPES
        ):
            writer.writerow(
                {
                    "subtype": subtype,
                    "display_name": (
                        DISPLAY_NAMES[
                            subtype
                        ]
                    ),
                    "precision": float(
                        per_precision[
                            index
                        ]
                    ),
                    "recall": float(
                        per_recall[
                            index
                        ]
                    ),
                    "f1": float(
                        per_f1[
                            index
                        ]
                    ),
                    "support": int(
                        per_support[
                            index
                        ]
                    ),
                }
            )

    with (
        OUTPUT_DIR
        / "confusion_matrix.csv"
    ).open(
        "w",
        newline="",
        encoding="utf-8",
    ) as file:
        writer = csv.writer(
            file
        )

        writer.writerow(
            [
                "true/predicted",
                *ALL_SUBTYPES,
            ]
        )

        for subtype, row in zip(
            ALL_SUBTYPES,
            cm,
        ):
            writer.writerow(
                [
                    subtype,
                    *[
                        int(value)
                        for value in row
                    ],
                ]
            )

    print()
    print("=" * 72)

    print(
        "DUAL SPECIALIST FINAL TEST RESULTS"
    )

    print("=" * 72)

    print(
        f"Total Images      : {len(image_paths)}"
    )

    print(
        f"Accuracy          : {accuracy * 100:.2f}%"
    )

    print(
        "Balanced Accuracy : "
        f"{balanced_accuracy * 100:.2f}%"
    )

    print(
        f"Macro Precision   : {macro_precision * 100:.2f}%"
    )

    print(
        f"Macro Recall      : {macro_recall * 100:.2f}%"
    )

    print(
        f"Macro F1          : {macro_f1 * 100:.2f}%"
    )

    print(
        f"Weighted F1       : {weighted_f1 * 100:.2f}%"
    )

    print()

    print(
        "Per-subtype:"
    )

    for index, subtype in enumerate(
        ALL_SUBTYPES
    ):
        print(
            f"{DISPLAY_NAMES[subtype]:22s} "
            f"P={per_precision[index] * 100:6.2f}% "
            f"R={per_recall[index] * 100:6.2f}% "
            f"F1={per_f1[index] * 100:6.2f}% "
            f"N={int(per_support[index])}"
        )

    print()

    print(
        "Saved to:",
        OUTPUT_DIR.resolve(),
    )


if __name__ == "__main__":
    main()
