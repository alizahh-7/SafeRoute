"""
SafeRoute Telangana — Vision Module
Trains a YOLOv8 model on the India subset of RDD2022 to detect road damage.
"""

import os
import shutil
from ultralytics import YOLO


def build_india_subset(base_path, out_path):
    """Filters RDD2022 to India-only images/labels, split by train/val/test."""
    for split in ["train", "val", "test"]:
        img_src = f"{base_path}/{split}/images"
        lbl_src = f"{base_path}/{split}/labels"
        img_dst = f"{out_path}/{split}/images"
        lbl_dst = f"{out_path}/{split}/labels"

        os.makedirs(img_dst, exist_ok=True)
        os.makedirs(lbl_dst, exist_ok=True)

        india_imgs = [
            f for f in os.listdir(img_src)
            if f.startswith("India_")
        ]

        for f in india_imgs:
            shutil.copy(
                os.path.join(img_src, f),
                os.path.join(img_dst, f),
            )

            label_name = f.rsplit(".", 1)[0] + ".txt"
            label_path = os.path.join(lbl_src, label_name)

            if os.path.exists(label_path):
                shutil.copy(
                    label_path,
                    os.path.join(lbl_dst, label_name),
                )


def write_data_yaml(out_path):
    yaml_content = f"""path: {out_path}
train: train/images
val: val/images
test: test/images

names:
  0: longitudinal crack
  1: transverse crack
  2: alligator crack
  3: other corruption
  4: pothole
"""

    with open(f"{out_path}/data.yaml", "w") as f:
        f.write(yaml_content)


def train(data_yaml_path, epochs=50, model_size="yolov8s.pt"):
    model = YOLO(model_size)

    results = model.train(
        data=data_yaml_path,
        epochs=epochs,
        imgsz=640,
        batch=16,
        project="runs",
        name="india_road_damage",
    )

    return results


if __name__ == "__main__":
    BASE = "data/rdd2022/RDD_SPLIT"
    OUT = "data/india_subset"

    build_india_subset(BASE, OUT)
    write_data_yaml(OUT)
    train(f"{OUT}/data.yaml")