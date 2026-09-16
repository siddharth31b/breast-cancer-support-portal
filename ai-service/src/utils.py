import os

os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"

import random
from pathlib import Path
from typing import Any

import numpy as np
import tensorflow as tf
import yaml

PROJECT_ROOT = Path(__file__).resolve().parents[1]
CONFIG_PATH = PROJECT_ROOT / "config" / "config.yaml"

CLASS_NAMES: dict[int, str] = {
    0: "benign",
    1: "malignant",
}


def load_config(
    config_path: Path = CONFIG_PATH,
) -> dict[str, Any]:
    """Load project configuration from YAML."""
    if not config_path.exists():
        raise FileNotFoundError(
            f"Configuration file not found: {config_path}"
        )

    with config_path.open(
        "r",
        encoding="utf-8",
    ) as file:
        config = yaml.safe_load(file)

    if not isinstance(config, dict):
        raise ValueError(
            "Configuration file must contain a YAML dictionary."
        )

    return config


def resolve_project_path(
    relative_path: str | Path,
) -> Path:
    """Convert a project-relative path into an absolute path."""
    path = Path(relative_path)

    if path.is_absolute():
        return path

    return (PROJECT_ROOT / path).resolve()


def set_global_seed(seed: int) -> None:
    """Set Python, NumPy and TensorFlow random seeds."""
    os.environ["PYTHONHASHSEED"] = str(seed)

    random.seed(seed)
    np.random.seed(seed)
    tf.random.set_seed(seed)


def ensure_directory(path: str | Path) -> Path:
    """Create a directory when it does not already exist."""
    resolved_path = resolve_project_path(path)

    resolved_path.mkdir(
        parents=True,
        exist_ok=True,
    )

    return resolved_path

