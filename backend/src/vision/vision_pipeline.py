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

from src.vision.detect import load_model, detect_damage, severity_from_detections


MAPILLARY_TOKEN = os.getenv("MAPILLARY_TOKEN")
FALLBACK_IMAGES = glob.glob("data/india_subset/test/images/*.jpg")


def get_street_image_near(lat: float, lon: float, radius: int = 50):
    """
    Returns a real street photo URL near the coords, or None on no
    coverage/error. radius is capped at 50m — this is a hard limit
    enforced by Mapillary's API, not a configurable choice.
    """

    url = "https://graph.mapillary.com/images"

    params = {
        "access_token": MAPILLARY_TOKEN,
        "fields": "id,thumb_1024_url",
        "lat": lat,
        "lng": lon,
        "radius": radius,
        "limit": 1,
    }

    try:
        response = requests.get(url, params=params, timeout=5)
        response.raise_for_status()

        data = response.json().get("data", [])

        return data[0]["thumb_1024_url"] if data else None

    except Exception:
        return None


def get_street_image_for_segment(coordinates, radius: int = 50):
    """
    Tries Mapillary at multiple points along a segment (start, middle,
    end) rather than a single point, to improve odds of finding real
    coverage given the fixed 50m radius.

    coordinates: list of [lat, lon] pairs along the segment.
    """

    points_to_try = [coordinates[0], coordinates[-1]]

    if len(coordinates) > 2:
        points_to_try.insert(1, coordinates[len(coordinates) // 2])

    for lat, lon in points_to_try:
        url = get_street_image_near(lat, lon, radius)

        if url:
            return url

    return None


def get_segment_vision_severity(model, lat: float, lon: float):
    """
    Single-point version: returns (vision_severity, image_source)
    for one coordinate.

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


def get_segment_vision_severity_multi(model, coordinates):
    """
    Full-segment version: tries multiple points along the segment's
    coordinates list before falling back. Use this once wired to
    Umaima's real segment data (which provides a coordinates list,
    not a single point).
    """

    image_url = get_street_image_for_segment(coordinates)

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