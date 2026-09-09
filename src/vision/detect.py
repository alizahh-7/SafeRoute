"""
SafeRoute Telangana — Vision Module

Runs trained YOLOv8 model on road images to detect damage severity.
"""

from ultralytics import YOLO


CLASS_NAMES = [
    "longitudinal crack",
    "transverse crack",
    "alligator crack",
    "other corruption",
    "pothole",
]


def load_model(weights_path="best.pt"):
    return YOLO(weights_path)


def detect_damage(model, image_path, conf=0.25):
    """
    Runs detection on a single image (local path or URL).

    Returns a list of detections:
    [{class, confidence, bbox}, ...]
    """

    results = model.predict(
        image_path,
        conf=conf,
        verbose=False,
    )

    detections = []

    for r in results:
        for box in r.boxes:
            detections.append(
                {
                    "class": CLASS_NAMES[int(box.cls[0])],
                    "confidence": float(box.conf[0]),
                    "bbox": box.xyxy[0].tolist(),
                }
            )

    return detections


def severity_from_detections(detections):
    """
    Maps detections to the frozen schema:
    "none" | "minor" | "moderate" | "severe"

    Previously: "none" | "low" | "medium" | "high"
    """

    if not detections:
        return "none"

    max_conf = max(
        d["confidence"] for d in detections
    )

    count = len(detections)

    if max_conf > 0.6 or count >= 3:
        return "severe"
    elif max_conf > 0.4 or count == 2:
        return "moderate"

    return "minor"


if __name__ == "__main__":
    model = load_model()

    dets = detect_damage(
        model,
        "sample.jpg",
    )

    print(dets)
    print(
        "Severity:",
        severity_from_detections(dets),
    )