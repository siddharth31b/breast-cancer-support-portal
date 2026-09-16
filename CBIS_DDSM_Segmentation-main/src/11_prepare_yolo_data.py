import os
import glob
import cv2
import numpy as np
from tqdm import tqdm

def mask_to_yolo_bbox(mask_path):
    mask = cv2.imread(mask_path, cv2.IMREAD_GRAYSCALE)
    if mask is None:
        return []
    
    # Binary threshold
    _, binary = cv2.threshold(mask, 127, 255, cv2.THRESH_BINARY)
    contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    h_img, w_img = mask.shape
    bboxes = []
    
    for cnt in contours:
        area = cv2.contourArea(cnt)
        if area < 20:  # Noise filter
            continue
        x, y, w, h = cv2.boundingRect(cnt)
        # Normalize coordinates [0.0 - 1.0] for YOLO
        x_center = (x + w / 2.0) / w_img
        y_center = (y + h / 2.0) / h_img
        norm_w = w / w_img
        norm_h = h / h_img
        bboxes.append((0, x_center, y_center, norm_w, norm_h))
        
    return bboxes

def convert_split(img_dir, mask_dir, out_img_dir, out_label_dir):
    os.makedirs(out_img_dir, exist_ok=True)
    os.makedirs(out_label_dir, exist_ok=True)
    
    img_paths = sorted(glob.glob(os.path.join(img_dir, "*.png")))
    
    for img_p in tqdm(img_paths, desc=f"Converting {os.path.basename(img_dir)}"):
        base_name = os.path.basename(img_p)
        mask_p = os.path.join(mask_dir, base_name)
        
        # Read and save 512x512 image
        img = cv2.imread(img_p)
        img_resized = cv2.resize(img, (512, 512))
        cv2.imwrite(os.path.join(out_img_dir, base_name), img_resized)
        
        # Get bounding boxes
        bboxes = mask_to_yolo_bbox(mask_p)
        label_p = os.path.join(out_label_dir, base_name.replace(".png", ".txt"))
        
        with open(label_p, "w") as f:
            for bbox in bboxes:
                f.write(f"{bbox[0]} {bbox[1]:.6f} {bbox[2]:.6f} {bbox[3]:.6f} {bbox[4]:.6f}\n")

if __name__ == "__main__":
    # Train conversion
    convert_split(
        img_dir="data/processed/train/images",
        mask_dir="data/processed/train/masks",
        out_img_dir="data/yolo_dataset/images/train",
        out_label_dir="data/yolo_dataset/labels/train"
    )
    # Test conversion (Validation)
    convert_split(
        img_dir="data/processed/test/images",
        mask_dir="data/processed/test/masks",
        out_img_dir="data/yolo_dataset/images/val",
        out_label_dir="data/yolo_dataset/labels/val"
    )
    
    # Generate data.yaml
    yaml_content = f"""path: {os.path.abspath('data/yolo_dataset')}
train: images/train
val: images/val

names:
  0: mass_lesion
"""
    with open("data/yolo_dataset/dataset.yaml", "w") as f:
        f.write(yaml_content)
        
    print("\nYOLO Dataset successfully generated in data/yolo_dataset/")