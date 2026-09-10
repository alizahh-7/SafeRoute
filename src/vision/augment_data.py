"""
SafeRoute Telangana — Vision Module

Targeted data augmentation for the transverse crack class,
which has very low representation (~300 images) in the
RDD2022 India subset.

Run BEFORE a retraining pass to address this documented limitation.
"""

import os
import random
import shutil

from PIL import Image, ImageEnhance


def augment_transverse_crack_images(
    images_dir,
    labels_dir,
    class_id=1,
    num_augments=3,
):
    target_files = []

    for label_file in os.listdir(labels_dir):
        label_path = os.path.join(labels_dir, label_file)

        with open(label_path) as file:
            lines = file.readlines()

        if any(
            line.startswith(f"{class_id} ")
            for line in lines
        ):
            target_files.append(
                label_file.replace(".txt", ".jpg")
            )

    print(
        f"Found {len(target_files)} images "
        "with transverse crack"
    )

    for image_name in target_files:
        image_path = os.path.join(images_dir, image_name)

        label_path = os.path.join(
            labels_dir,
            image_name.replace(".jpg", ".txt"),
        )

        if not os.path.exists(image_path):
            continue

        image = Image.open(image_path)

        for i in range(num_augments):
            augmented_image = image.copy()

            enhancer = ImageEnhance.Brightness(
                augmented_image
            )

            augmented_image = enhancer.enhance(
                random.uniform(0.7, 1.3)
            )

            new_image_name = image_name.replace(
                ".jpg",
                f"_aug{i}.jpg",
            )

            new_label_name = new_image_name.replace(
                ".jpg",
                ".txt",
            )

            augmented_image.save(
                os.path.join(
                    images_dir,
                    new_image_name,
                )
            )

            shutil.copy(
                label_path,
                os.path.join(
                    labels_dir,
                    new_label_name,
                ),
            )

    print(
        f"Created "
        f"{len(target_files) * num_augments} "
        "augmented images"
    )


if __name__ == "__main__":
    augment_transverse_crack_images(
        "data/india_subset/train/images",
        "data/india_subset/train/labels",
    )