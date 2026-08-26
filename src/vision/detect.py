@'
"""
SafeRoute Telangana — Vision Module
Runs trained YOLOv8 model on road images to detect damage severity.
"""
from ultralytics import YOLO

CLASS_NAMES = ["longitudinal crack", "transverse crack", "alligator crack", "other corruption", "pothole"]

def load_model(weights_path="weights/best.pt"):
    return YOLO(weights_path)

def detect_damage(model, image_path, conf=0.25):
    """
    Runs detection on a single image.
    Returns a list of detections: [{class, confidence, bbox}, ...]
    """
    results = model.predict(image_path, conf=conf, verbose=False)
    detections = []
    for r in results:
        for box in r.boxes:
            detections.append({
                "class": CLASS_NAMES[int(box.cls[0])],
                "confidence": float(box.conf[0]),
                "bbox": box.xyxy[0].tolist()
            })
    return detections

def severity_from_detections(detections):
    """
    Simple severity rating based on detection count/confidence.
    Placeholder logic - refine once wired into Umaimas fusion engine.
    """
    if not detections:
        return "none"
    max_conf = max(d["confidence"] for d in detections)
    if max_conf > 0.6 or len(detections) >= 3:
        return "high"
    elif max_conf > 0.35:
        return "medium"
    return "low"

if __name__ == "__main__":
    model = load_model()
    dets = detect_damage(model, "sample.jpg")
    print(dets)
    print("Severity:", severity_from_detections(dets))
'@ | Out-File -FilePath src\vision\detect.py -Encoding utf8