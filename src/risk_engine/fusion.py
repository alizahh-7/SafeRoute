"""
fusion.py
Owner: Umaima — the heart of the system. Everyone else's output flows into this.
"""

from src.risk_engine.explain import generate_explanation

TRAFFIC_POINTS = {"low": 0, "medium": 5, "high": 12, "severe": 20}
VISION_POINTS = {"none": 0, "minor": 5, "moderate": 12, "severe": 22}
WATERLOGGING_POINTS = 15
NEWS_POINTS = 8


def fuse_segment_risk(segment: dict) -> dict:
    base = segment.get("historical_score") or 0.0
    weather_add = segment.get("weather_modifier") or 0
    traffic_add = TRAFFIC_POINTS.get(segment.get("traffic_level"), 0)
    waterlogging_add = WATERLOGGING_POINTS if segment.get("waterlogging_flag") else 0
    vision_add = VISION_POINTS.get(segment.get("vision_severity"), 0)
    news_add = NEWS_POINTS if segment.get("news_flags") else 0

    total = base + weather_add + traffic_add + waterlogging_add + vision_add + news_add
    segment["final_score"] = round(min(total, 100.0), 1)
    segment["explanation"] = generate_explanation(segment)
    return segment


def fuse_all_segments(segments: list[dict]) -> list[dict]:
    return [fuse_segment_risk(s) for s in segments]


def route_total_risk(segments: list[dict]) -> float:
    scores = [s["final_score"] for s in segments if s.get("final_score") is not None]
    return round(sum(scores) / len(scores), 1) if scores else 0.0