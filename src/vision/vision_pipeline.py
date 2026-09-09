"""
SafeRoute Telangana — Vision Module

Fetches a real street-level photo for a segment's coordinates (Mapillary),
falls back to an RDD2022 sample image if no coverage exists, then runs
detection on whichever image was found. This is what actually fills
vision_severity in Umaima's segment JSON.
"""

import glob
import os
import random

import requests

from detect import load_model, detect_damage, severity_from_detections


MAPILLARY_TOKEN = os.getenv("MAPILLARY_TOKEN")
FALLBACK_IMAGES = glob.glob("data/india_subset/test/images/*.jpg")


def get_street_image_near(lat: float, lon: float, radius: int = 100):
    """Returns a real street photo URL near the coords, or None on no coverage/error."""

    url = "https://graph.mapillary.com/images"

    params = {
        "access_token": MAPILLARY_TOKEN,
        "fields": "id,thumb_1024_url",
        "closeto": f"{lon},{lat}",
        "radius": radius,
    }

    try:
        response = requests.get(url, params=params, timeout=5)
        response.raise_for_status()

        data = response.json().get("data", [])

        return data[0]["thumb_1024_url"] if data else None

    except Exception:
        return None


def get_segment_vision_severity(model, lat: float, lon: float):
    """
    Returns (vision_severity, image_source) for a segment.

    image_source is 'mapillary' or 'rdd2022_sample' —
    log this for the report.
    """

    image_url = get_street_image_near(lat, lon)

    if image_url:
        detections = detect_damage(model, image_url)
        source = "mapillary"
    else:
        fallback_img = random.choice(FALLBACK_IMAGES)
        detections = detect_damage(model, fallback_img)
        source = "rdd2022_sample"

    severity = severity_from_detections(detections)

    return severity, source


if __name__ == "__main__":
    model = load_model("best.pt")

    severity, source = get_segment_vision_severity(
        model,
        17.4065,
        78.4691,
    )

    print(f"Severity: {severity} (source: {source})")