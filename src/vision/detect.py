"""
SafeRoute Telangana — Vision Module
Runs trained YOLOv8 model on road images to detect damage severity.
Severity scoring weights detection confidence, bounding box size
(bigger = closer/more severe), and class-specific risk weighting.
"""

from ultralytics import YOLO


CLASS_NAMES = [
    "longitudinal crack",
    "transverse crack",
    "alligator crack",
    "other corruption",
    "pothole",
]

CLASS_WEIGHTS = {
    "pothole": 1.0,
    "alligator crack": 0.85,
    "other corruption": 0.7,
    "longitudinal crack": 0.5,
    "transverse crack": 0.5,
}


def load_model(weights_path="best.pt"):
    return YOLO(weights_path)


def detect_damage(model, image_path, conf=0.25):
    """
    Runs detection on a single image (local path or URL).

    Returns:
        list: [
            {
                "class": str,
                "confidence": float,
                "bbox": list
            },
            ...
        ]
    """
    results = model.predict(image_path, conf=conf, verbose=False)

    detections = []

    for result in results:
        for box in result.boxes:
            detections.append(
                {
                    "class": CLASS_NAMES[int(box.cls[0])],
                    "confidence": float(box.conf[0]),
                    "bbox": box.xyxy[0].tolist(),
                }
            )

    return detections


def bbox_area_ratio(bbox, img_width=640, img_height=640):
    """Returns what fraction of the image the bounding box covers."""
    x1, y1, x2, y2 = bbox

    box_area = (x2 - x1) * (y2 - y1)
    img_area = img_width * img_height

    return box_area / img_area


def severity_from_detections(detections, img_width=640, img_height=640):
    """
    Weighted severity: combines detection confidence, bbox size,
    and class risk weighting.

    Returns:
        "none" | "minor" | "moderate" | "severe"
    """
    if not detections:
        return "none"

    scores = []

    for detection in detections:
        class_weight = CLASS_WEIGHTS.get(detection["class"], 0.5)

        size_ratio = bbox_area_ratio(
            detection["bbox"],
            img_width,
            img_height,
        )

        weighted_score = (
            detection["confidence"] * class_weight
        ) + min(size_ratio * 3, 0.3)

        scores.append(weighted_score)

    max_score = max(scores)
    count = len(detections)

    if max_score > 0.75 or count >= 3:
        return "severe"
    elif max_score > 0.45 or count == 2:
        return "moderate"

    return "minor"


if __name__ == "__main__":
    model = load_model()
    detections = detect_damage(model, "sample.jpg")

    print(detections)
    print("Severity:", severity_from_detections(detections))