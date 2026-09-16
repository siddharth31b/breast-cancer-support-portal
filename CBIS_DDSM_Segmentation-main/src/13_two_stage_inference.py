import os
import glob
import cv2
import numpy as np
import pandas as pd
import torch
import albumentations as A
from albumentations.pytorch import ToTensorV2
from ultralytics import YOLO
import segmentation_models_pytorch as smp
from tqdm import tqdm

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# 1. Load Stage-1: Detector (Auto-resolves exact trained runs directory)
candidate_paths = [
    r"C:\Users\HP\Desktop\CBIS_DDSM_Segmentation\runs\detect\models\yolo_detector\mass_detector_run\weights\best.pt",
    "runs/detect/models/yolo_detector/mass_detector_run/weights/best.pt",
    "models/yolo_detector/mass_detector_run/weights/best.pt"
]

yolo_path = next((p for p in candidate_paths if os.path.exists(p)), None)
if not yolo_path:
    raise FileNotFoundError("YOLO best.pt checkpoint nahi mila! Please check runs/ directory.")

print(f"Loading Stage-1 YOLO Detector from: {yolo_path}")
detector = YOLO(yolo_path)

# 2. Load Stage-2: Segmenter
segmenter = smp.Unet(
    encoder_name="efficientnet-b4",
    in_channels=1,
    classes=1,
    decoder_attention_type="scse"
).to(device)

segmenter_path = "models/efficientnet_b4_512_best.pth"
if not os.path.exists(segmenter_path):
    raise FileNotFoundError(f"Segmenter checkpoint nahi mila: {segmenter_path}")

segmenter.load_state_dict(torch.load(segmenter_path, map_location=device, weights_only=False))
segmenter.eval()

transform_patch = A.Compose([
    A.Resize(256, 256),
    A.CLAHE(clip_limit=3.0, tile_grid_size=(8, 8), p=1.0),
    A.Normalize(mean=[0.5], std=[0.5]),
    ToTensorV2()
])

def evaluate_two_stage():
    img_paths = sorted(glob.glob("data/processed/test/images/*.png"))
    mask_paths = sorted(glob.glob("data/processed/test/masks/*.png"))
    
    if len(img_paths) == 0:
        raise FileNotFoundError("Test images nahi mili 'data/processed/test/images/' me.")
    
    results = []
    print(f"Running Two-Stage Cascaded Pipeline on {len(img_paths)} test scans...")
    
    for img_p, mask_p in tqdm(zip(img_paths, mask_paths), total=len(img_paths)):
        orig = cv2.imread(img_p, cv2.IMREAD_GRAYSCALE)
        gt = cv2.imread(mask_p, cv2.IMREAD_GRAYSCALE)
        gt_binary = (cv2.resize(gt, (512, 512)) > 127).astype(np.uint8)
        
        h_orig, w_orig = orig.shape
        full_pred_mask = np.zeros((512, 512), dtype=np.uint8)
        
        # Stage 1: Detector inference
        det_res = detector.predict(orig, imgsz=512, conf=0.15, verbose=False)[0]
        
        if len(det_res.boxes) > 0:
            # Pick highest confidence detection box
            box = det_res.boxes.xyxy[0].cpu().numpy().astype(int)
            x1, y1, x2, y2 = box
            
            # Padding around bounding box
            pad = 20
            x1, y1 = max(0, x1 - pad), max(0, y1 - pad)
            x2, y2 = min(w_orig, x2 + pad), min(h_orig, y2 + pad)
            
            patch = orig[y1:y2, x1:x2]
            if patch.size > 0:
                # Stage 2: Segmentation on patch
                aug = transform_patch(image=patch)
                t_patch = aug['image'].unsqueeze(0).to(device)
                
                with torch.no_grad():
                    logits = segmenter(t_patch)
                    probs = torch.sigmoid(logits).squeeze().cpu().numpy()
                    pred_patch = (probs > 0.40).astype(np.uint8)
                
                # Resize patch prediction back to detected box dimension
                pred_patch_resized = cv2.resize(pred_patch, (x2 - x1, y2 - y1))
                
                # Repaste to 512x512 canvas coordinates
                s_x1, s_y1 = int(x1 * 512 / w_orig), int(y1 * 512 / h_orig)
                s_x2, s_y2 = int(x2 * 512 / w_orig), int(y2 * 512 / h_orig)
                
                paste_h, paste_w = s_y2 - s_y1, s_x2 - s_x1
                if paste_h > 0 and paste_w > 0:
                    pred_patch_scaled = cv2.resize(pred_patch_resized, (paste_w, paste_h))
                    full_pred_mask[s_y1:s_y2, s_x1:s_x2] = pred_patch_scaled
        
        # Compute Dice & IoU
        intersection = np.logical_and(full_pred_mask, gt_binary).sum()
        dice = (2.0 * intersection) / (full_pred_mask.sum() + gt_binary.sum() + 1e-6)
        iou = intersection / (np.logical_or(full_pred_mask, gt_binary).sum() + 1e-6)
        
        results.append({"filename": os.path.basename(img_p), "dice": dice, "iou": iou})
        
    df = pd.DataFrame(results)
    os.makedirs("outputs/evaluation_reports", exist_ok=True)
    df.to_csv("outputs/evaluation_reports/two_stage_test_metrics.csv", index=False)
    
    print("\n" + "="*60)
    print(f"Two-Stage Pipeline Mean Dice  : {df['dice'].mean():.4f}")
    print(f"Zero-Dice Failure Count       : {(df['dice'] == 0.0).sum()} / {len(df)}")
    print(f"Non-Zero Detected Mean Dice   : {df[df['dice'] > 0]['dice'].mean():.4f}")
    print("="*60)

if __name__ == "__main__":
    evaluate_two_stage()