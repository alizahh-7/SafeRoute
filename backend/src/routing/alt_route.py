"""
alt_route.py
Compares the primary route against an alternate and suggests the safer
one if it's meaningfully lower-risk without a huge time cost.
"""

from src.api_clients.geocode import geocode
from src.api_clients.maps_routing import get_alternative_routes
from src.risk_engine.fusion import route_total_risk
from main import score_route
from src.live_signals.waterlogging import load_waterlogging_points
from src.vision.detect import load_model

RISK_IMPROVEMENT_THRESHOLD = 0.15   # alt must be 15%+ safer to be worth suggesting
MAX_ACCEPTABLE_TIME_INCREASE = 0.20  # won't suggest a route more than 20% slower


def suggest_safer_route(origin_name: str, destination_name: str) -> dict:
    origin = geocode(origin_name)
    destination = geocode(destination_name)
    routes = get_alternative_routes(origin, destination)

    if len(routes) < 2:
        return {"alternate_available": False, "reason": "No alternate route found for this trip."}

    waterlogging_points = load_waterlogging_points()
    vision_model = load_model("src/vision/best.pt")

    scored_routes = []
    for route in routes:
        segments = score_route(route["coordinates"], waterlogging_points, vision_model)
        scored_routes.append({
            "risk": route_total_risk(segments),
            "duration_sec": route["duration_sec"],
            "segments": segments,
        })

    primary, alternate = scored_routes[0], min(scored_routes[1:], key=lambda r: r["risk"])

    risk_improvement = (primary["risk"] - alternate["risk"]) / primary["risk"] if primary["risk"] else 0
    time_increase = (alternate["duration_sec"] - primary["duration_sec"]) / primary["duration_sec"]

    should_suggest = risk_improvement >= RISK_IMPROVEMENT_THRESHOLD and time_increase <= MAX_ACCEPTABLE_TIME_INCREASE

    return {
        "alternate_available": True,
        "should_suggest_alternate": should_suggest,
        "primary_risk": primary["risk"],
        "alternate_risk": alternate["risk"],
        "extra_time_minutes": round((alternate["duration_sec"] - primary["duration_sec"]) / 60, 1),
        "primary_segments": primary["segments"],
        "alternate_segments": alternate["segments"] if should_suggest else None,
    }