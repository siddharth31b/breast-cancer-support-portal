import os
import glob
import cv2
import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
import albumentations as A
from albumentations.pytorch import ToTensorV2
import segmentation_models_pytorch as smp
from tqdm import tqdm

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# 1. High-Resolution Medical Augmentation with CLAHE
train_transform = A.Compose([
    A.Resize(512, 512),
    A.CLAHE(clip_limit=3.0, tile_grid_size=(8, 8), p=0.8),
    A.HorizontalFlip(p=0.5),
    A.VerticalFlip(p=0.5),
    A.ShiftScaleRotate(shift_limit=0.08, scale_limit=0.1, rotate_limit=15, p=0.5),
    A.Normalize(mean=[0.5], std=[0.5]),
    ToTensorV2()
])

val_transform = A.Compose([
    A.Resize(512, 512),
    A.CLAHE(clip_limit=3.0, tile_grid_size=(8, 8), p=0.8),
    A.Normalize(mean=[0.5], std=[0.5]),
    ToTensorV2()
])


class CBISDataset512(Dataset):
    def __init__(self, img_dir, mask_dir, transform=None):
        self.img_paths = sorted(glob.glob(os.path.join(img_dir, "*.png")))
        self.mask_paths = sorted(glob.glob(os.path.join(mask_dir, "*.png")))
        self.transform = transform

    def __len__(self):
        return len(self.img_paths)

    def __getitem__(self, idx):
        img = cv2.imread(self.img_paths[idx], cv2.IMREAD_GRAYSCALE)
        mask = cv2.imread(self.mask_paths[idx], cv2.IMREAD_GRAYSCALE)
        mask = (mask > 127).astype(np.float32)

        if self.transform:
            augmented = self.transform(image=img, mask=mask)
            img_t = augmented['image']
            mask_t = augmented['mask'].unsqueeze(0)
        else:
            img_t = torch.from_numpy(img).unsqueeze(0).float() / 255.0
            mask_t = torch.from_numpy(mask).unsqueeze(0).float()

        return img_t, mask_t


class CombinedLoss(nn.Module):
    def __init__(self):
        super().__init__()
        self.bce = nn.BCEWithLogitsLoss()
        self.dice = smp.losses.DiceLoss(mode='binary')

    def forward(self, pred, target):
        return 0.4 * self.bce(pred, target) + 0.6 * self.dice(pred, target)


def main():
    # Datasets & Loaders
    train_dataset = CBISDataset512("data/processed/train/images", "data/processed/train/masks", transform=train_transform)
    # Windows safe DataLoader with num_workers=0 or num_workers=2
    train_loader = DataLoader(train_dataset, batch_size=8, shuffle=True, num_workers=0, pin_memory=True)

    # Pretrained EfficientNet-B4 U-Net (Attention-capable backbone)
    model = smp.Unet(
        encoder_name="efficientnet-b4",
        encoder_weights="imagenet",
        in_channels=1,
        classes=1,
        decoder_attention_type="scse"
    ).to(device)

    # Hybrid Loss & Optimizer
    criterion = CombinedLoss()
    optimizer = torch.optim.AdamW(model.parameters(), lr=1e-4, weight_decay=1e-4)
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=20, eta_min=1e-6)

    EPOCHS = 20
    os.makedirs("models", exist_ok=True)
    best_loss = float('inf')

    print(f"Training Pretrained EfficientNet-B4 U-Net (512x512) on RTX A4000 across {len(train_dataset)} samples...")

    for epoch in range(1, EPOCHS + 1):
        model.train()
        running_loss = 0.0
        for imgs, masks in tqdm(train_loader, desc=f"Epoch {epoch:02d}/{EPOCHS}"):
            imgs, masks = imgs.to(device), masks.to(device)
            optimizer.zero_grad()
            preds = model(imgs)
            loss = criterion(preds, masks)
            loss.backward()
            optimizer.step()
            running_loss += loss.item()

        scheduler.step()
        avg_loss = running_loss / len(train_loader)
        print(f"Epoch {epoch:02d} | Avg Loss: {avg_loss:.4f} | LR: {scheduler.get_last_lr()[0]:.6f}")

        if avg_loss < best_loss:
            best_loss = avg_loss
            torch.save(model.state_dict(), "models/efficientnet_b4_512_best.pth")

    print("\n[SUCCESS] Training Complete! Checkpoint saved -> models/efficientnet_b4_512_best.pth")


if __name__ == '__main__':
    main()