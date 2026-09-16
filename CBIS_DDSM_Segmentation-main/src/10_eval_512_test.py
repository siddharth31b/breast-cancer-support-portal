import os
import glob
import cv2
import numpy as np
import pandas as pd
import torch
import albumentations as A
from albumentations.pytorch import ToTensorV2
import segmentation_models_pytorch as smp
from tqdm import tqdm

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

val_transform = A.Compose([
    A.Resize(512, 512),
    A.CLAHE(clip_limit=3.0, tile_grid_size=(8, 8), p=0.8),
    A.Normalize(mean=[0.5], std=[0.5]),
    ToTensorV2()
])

model = smp.Unet(
    encoder_name="efficientnet-b4",
    in_channels=1,
    classes=1,
    decoder_attention_type="scse"
).to(device)

model.load_state_dict(torch.load("models/efficientnet_b4_512_best.pth", map_location=device))
model.eval()

img_paths = sorted(glob.glob("data/processed/test/images/*.png"))
mask_paths = sorted(glob.glob("data/processed/test/masks/*.png"))

records = []
print(f"Evaluating 512x512 EfficientNet on {len(img_paths)} test cases...")

with torch.no_grad():
    for img_p, mask_p in tqdm(zip(img_paths, mask_paths), total=len(img_paths)):
        img = cv2.imread(img_p, cv2.IMREAD_GRAYSCALE)
        mask = cv2.imread(mask_p, cv2.IMREAD_GRAYSCALE)
        mask_binary = (mask > 127).astype(np.float32)

        aug = val_transform(image=img, mask=mask_binary)
        t_img = aug['image'].unsqueeze(0).to(device)
        gt_512 = aug['mask'].numpy().astype(np.uint8)

        logits = model(t_img)
        probs = torch.sigmoid(logits).squeeze().cpu().numpy()
        pred_512 = (probs > 0.40).astype(np.uint8)

        intersection = np.logical_and(pred_512, gt_512).sum()
        total_sum = pred_512.sum() + gt_512.sum()
        dice = (2.0 * intersection) / (total_sum + 1e-6)
        iou = intersection / (np.logical_or(pred_512, gt_512).sum() + 1e-6)

        records.append({"filename": os.path.basename(img_p), "dice": dice, "iou": iou})

df = pd.DataFrame(records)
os.makedirs("outputs/evaluation_reports", exist_ok=True)
df.to_csv("outputs/evaluation_reports/test_metrics_512_efficientnet.csv", index=False)

print("\n" + "="*50)
print(f"Mean Test Dice: {df['dice'].mean():.4f}")
print(f"Zero Dice Cases: {(df['dice'] == 0.0).sum()} / {len(df)}")
print(f"Non-Zero Mean Dice: {df[df['dice'] > 0]['dice'].mean():.4f}")
print("="*50)