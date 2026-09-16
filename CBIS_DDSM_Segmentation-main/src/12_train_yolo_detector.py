from ultralytics import YOLO
import torch

if __name__ == "__main__":
    device = 0 if torch.cuda.is_available() else "cpu"
    print(f"Starting Stage-1 YOLOv8 Training on Device: {device}")
    
    # Pretrained nano detector for fast convergence
    model = YOLO("yolov8n.pt")
    
    results = model.train(
        data="data/yolo_dataset/dataset.yaml",
        epochs=30,
        imgsz=512,
        batch=16,
        device=device,
        workers=4,
        project="models/yolo_detector",
        name="mass_detector_run",
        exist_ok=True,
        plots=True
    )
    print("\nStage-1 Detection Model Training Finished!")