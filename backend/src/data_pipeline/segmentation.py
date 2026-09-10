"""
segmentation.py
Owner: Umaima

Splits a route's polyline into fixed-length road segments.
This is the SHARED CONTRACT every other module builds against — see docs/schema.md.
"""

import uuid
from math import radians, sin, cos, sqrt, atan2


def haversine_m(p1: tuple[float, float], p2: tuple[float, float]) -> float:
    lat1, lon1 = p1
    lat2, lon2 = p2
    R = 6371000
    phi1, phi2 = radians(lat1), radians(lat2)
    dphi = radians(lat2 - lat1)
    dlambda = radians(lon2 - lon1)
    a = sin(dphi / 2) ** 2 + cos(phi1) * cos(phi2) * sin(dlambda / 2) ** 2
    return 2 * R * atan2(sqrt(a), sqrt(1 - a))


def _make_segment(points: list[tuple[float, float]]) -> dict:
    mid = points[len(points) // 2]
    return {
        "segment_id": str(uuid.uuid4())[:8],
        "coordinates": points,
        "midpoint": {"lat": mid[0], "lng": mid[1]},
        "road_name": None,
        "historical_score": None,
        "time_pattern_modifier": None,
        "weather_modifier": None,
        "traffic_level": None,
        "waterlogging_flag": None,
        "vision_severity": None,
        "news_flags": None,
        "final_score": None,
        "explanation": None,
    }


def segment_route(points: list[tuple[float, float]], segment_length_m: int = 500) -> list[dict]:
    if len(points) < 2:
        raise ValueError("Need at least 2 points to build a segment")

    segments = []
    current_chunk = [points[0]]
    accumulated = 0.0

    for i in range(1, len(points)):
        d = haversine_m(points[i - 1], points[i])
        accumulated += d
        current_chunk.append(points[i])
        if accumulated >= segment_length_m:
            segments.append(_make_segment(current_chunk))
            current_chunk = [points[i]]
            accumulated = 0.0

    if len(current_chunk) > 1:
        segments.append(_make_segment(current_chunk))

    return segments