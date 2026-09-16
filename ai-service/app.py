import json
import os
import sys
import uuid
from pathlib import Path

# Ensure ai-service directory is in sys.path
sys.path.insert(0, str(Path(__file__).parent.resolve()))

if sys.platform == "win32":
    try:
        if hasattr(sys.stdout, "reconfigure"):
            sys.stdout.reconfigure(encoding="utf-8")
        if hasattr(sys.stderr, "reconfigure"):
            sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

import logging
import warnings

os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"

warnings.filterwarnings("ignore")
logging.getLogger("tensorflow").setLevel(logging.ERROR)
logging.getLogger("tf_keras").setLevel(logging.ERROR)

try:
    import tensorflow as tf
    tf.get_logger().setLevel(logging.ERROR)
    tf.autograph.set_verbosity(0)
    tf.compat.v1.logging.set_verbosity(tf.compat.v1.logging.ERROR)
except Exception:
    pass

import keras
from flask import (
    Flask,
    abort,
    jsonify,
    request,
    send_from_directory,
)
from PIL import Image, UnidentifiedImageError
from werkzeug.utils import secure_filename

from src.gradcam import (
    generate_resnet50_gradcam,
    save_gradcam_images,
)
from src.predict import (
    load_registry,
    predict_image,
    prepare_image,
)
from src.subclass_ui_service import (
    add_binary_agreement,
    create_safe_subclass_ui_result,
)
from src.utils import PROJECT_ROOT


ALLOWED_EXTENSIONS = {
    ".png",
    ".jpg",
    ".jpeg",
    ".bmp",
    ".tif",
    ".tiff",
}

DEFAULT_UPLOAD_FOLDER = PROJECT_ROOT / "static" / "uploads"
DEFAULT_RESULTS_FOLDER = PROJECT_ROOT / "outputs" / "web_results"

_model = None
_registry = None


def allowed_file(filename: str) -> bool:
    return Path(filename).suffix.lower() in ALLOWED_EXTENSIONS


def verify_image_file(image_path: Path) -> None:
    try:
        with Image.open(image_path) as image:
            image.verify()
    except (UnidentifiedImageError, OSError, ValueError) as error:
        raise ValueError("The uploaded file is not a valid image.") from error


def get_registry() -> dict:
    global _registry
    if _registry is None:
        _registry = load_registry()
    return _registry


def get_model() -> keras.Model:
    global _model
    if _model is None:
        from src.predict import get_or_load_model
        registry = get_registry()
        model_path = (PROJECT_ROOT / registry["model_path"]).resolve()
        _model = get_or_load_model(model_path)
    return _model


def create_app(test_config: dict | None = None) -> Flask:
    app = Flask(__name__)

    app.config.from_mapping(
        SECRET_KEY="pathovision-local-development",
        MAX_CONTENT_LENGTH=10 * 1024 * 1024,
        UPLOAD_FOLDER=str(DEFAULT_UPLOAD_FOLDER),
        RESULTS_FOLDER=str(DEFAULT_RESULTS_FOLDER),
    )

    if test_config:
        app.config.update(test_config)

    upload_folder = Path(app.config["UPLOAD_FOLDER"])
    results_folder = Path(app.config["RESULTS_FOLDER"])

    upload_folder.mkdir(parents=True, exist_ok=True)
    results_folder.mkdir(parents=True, exist_ok=True)

    @app.get("/")
    def root():
        registry = get_registry()
        return jsonify({
            "name": "BreastCare AI ResNet50 Microservice API",
            "version": "1.0.0",
            "status": "online",
            "endpoints": {
                "health": "/api/health",
                "predict": "/api/predict",
            },
            "registry": registry
        }), 200

    @app.get("/api/health")
    def api_health():
        return jsonify({
            "status": "healthy",
            "service": "BreastCare ResNet50 AI Microservice",
            "model_loaded": _model is not None,
            "registry": get_registry()
        }), 200

    @app.post("/api/predict")
    def api_predict():
        if "image" not in request.files:
            return jsonify({"error": "No image field provided in request."}), 400

        uploaded_file = request.files["image"]

        if not uploaded_file.filename:
            return jsonify({"error": "No image file selected."}), 400

        original_filename = uploaded_file.filename

        if not allowed_file(original_filename):
            return jsonify({
                "error": "Unsupported file type. Supported formats: PNG, JPG, JPEG, BMP, TIF, TIFF."
            }), 400

        safe_name = secure_filename(original_filename) or "upload.png"

        prediction_id = uuid.uuid4().hex
        stored_filename = f"{prediction_id}_{safe_name}"
        upload_path = upload_folder / stored_filename

        uploaded_file.save(upload_path)

        try:
            verify_image_file(upload_path)
            registry = get_registry()

            # Reuse predict_image to prevent duplicate inference logic
            result, model = predict_image(
                image_path=upload_path,
                registry=registry,
            )

            _, processed_batch = prepare_image(
                image_path=upload_path,
                registry=registry,
            )

            subclass_result = create_safe_subclass_ui_result(
                upload_path,
                top_k=1,
                verify_hash=False,
            )

            subclass_result = add_binary_agreement(
                subclass_result,
                str(result.get("predicted_label", "")),
            )

            heatmap = generate_resnet50_gradcam(
                model=model,
                processed_batch=processed_batch,
                target_label_id=int(result["predicted_label_id"]),
            )

            prediction_folder = results_folder / prediction_id
            prediction_folder.mkdir(parents=True, exist_ok=True)

            heatmap_path, overlay_path = save_gradcam_images(
                image_path=upload_path,
                heatmap=heatmap,
                output_directory=prediction_folder,
                alpha=0.40,
            )

            predicted_class = str(result.get("predicted_label", "benign")).capitalize()
            prob = float(result.get("confidence", 0.5))

            if "malignant" in predicted_class.lower():
                birads = "BI-RADS 5 (Highly Suggestive of Malignancy)" if prob > 0.85 else "BI-RADS 4 (Suspicious Abnormality)"
            elif "benign" in predicted_class.lower():
                birads = "BI-RADS 2 (Benign Finding)"
            else:
                birads = "BI-RADS 1 (Negative / Normal)"

            base_url = request.host_url.rstrip("/")

            response_data = {
                "status": "success",
                "prediction_id": prediction_id,
                "predicted_class": predicted_class,
                "confidence": prob,
                "confidence_percentage": f"{prob * 100:.1f}%",
                "birads_category": birads,
                "original_filename": original_filename,
                "uploaded_image_url": f"{base_url}/uploads/{stored_filename}",
                "heatmap_url": f"{base_url}/results/{prediction_id}/{heatmap_path.name}",
                "overlay_url": f"{base_url}/results/{prediction_id}/{overlay_path.name}",
                "raw_result": result,
                "subclass_available": subclass_result.get("available", False),
                "predicted_subclass": subclass_result.get("subclass_display"),
                "predicted_subclass_display": subclass_result.get("subclass_display"),
                "predicted_subclass_key": subclass_result.get("subclass"),
                "subclass_main_class": subclass_result.get("main_class"),
                "subclass_confidence": subclass_result.get("confidence"),
                "subclass_confidence_percentage": subclass_result.get("confidence_percent"),
                "subclass_top_predictions": subclass_result.get("top_predictions", []),
                "binary_subclass_agreement": subclass_result.get("binary_agreement"),
                "subclass_agreement_message": subclass_result.get("binary_agreement_message"),
                "subclass_selection_method": subclass_result.get("selection_method"),
                "selected_specialist": subclass_result.get("selected_specialist"),
                "subclass_warning": subclass_result.get("warning"),
                "subclass_error": subclass_result.get("error"),
            }

            (prediction_folder / "result.json").write_text(
                json.dumps(response_data, indent=4),
                encoding="utf-8",
            )

            print(f" [Inference Complete] {predicted_class} ({prob * 100:.1f}%) | Subtype: {response_data.get('predicted_subclass')}", flush=True)
            return jsonify(response_data), 200

        except Exception as error:
            upload_path.unlink(missing_ok=True)
            app.logger.exception("API Prediction failed.")
            return jsonify({"error": f"Prediction failed: {str(error)}"}), 500

    @app.after_request
    def after_request_logger(response):
        if request.path != "/api/health":
            print(f" [API] {request.method} {request.path} -> {response.status_code}", flush=True)
        return response

    @app.get("/uploads/<path:filename>")
    def uploaded_file(filename: str):
        return send_from_directory(upload_folder, filename)

    @app.get("/results/<prediction_id>/<path:filename>")
    def result_file(prediction_id: str, filename: str):
        if not prediction_id.isalnum() or len(prediction_id) != 32:
            abort(404)
        return send_from_directory(results_folder / prediction_id, filename)

    @app.errorhandler(413)
    def file_too_large(error):
        return jsonify({"error": "Image is too large. Maximum upload size is 10 MB."}), 413

    @app.errorhandler(404)
    def page_not_found(error):
        return jsonify({"error": "Resource not found."}), 404

    return app


app = create_app()


if __name__ == "__main__":
    print("\n" + "=" * 70)
    print("  Initializing BreastCare AI Histopathology Service (Port 5000)...")
    try:
        get_model()
        print("  [OK] Primary ResNet50 Binary Model Loaded Successfully")
    except Exception as e:
        print(f"  [NOTE] Primary model deferred: {e}")

    print("  [OK] Server: Waitress WSGI Production Server")
    print("  [OK] Listening on: http://127.0.0.1:5000")
    print("  [OK] Health Check: http://127.0.0.1:5000/api/health")
    print("  [OK] Predict Endpoint: POST http://127.0.0.1:5000/api/predict")
    print("======================================================================\n", flush=True)

    try:
        from waitress import serve
        serve(app, host="127.0.0.1", port=5000, threads=4)
    except ImportError:
        app.run(host="127.0.0.1", port=5000, debug=False)

