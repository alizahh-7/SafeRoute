"""
alt_route.py
Compares the primary route against an alternate and suggests the safer
one if it's meaningfully lower-risk without a huge time cost.
"""

from src.api_clients.geocode import geocode
from src.api_clients.maps_routing import get_alternative_routes
from src.risk_engine.fusion import route_total_risk
from main import score_route, score_route_quick, route_quick_risk
from src.live_signals.waterlogging import load_waterlogging_points
from src.vision.detect import load_model

RISK_IMPROVEMENT_THRESHOLD = 0.01   # alt must be 15%+ safer to be worth suggesting
MAX_ACCEPTABLE_TIME_INCREASE = 1.0  # won't suggest a route more than 20% slower


def suggest_safer_route(origin_name: str, destination_name: str) -> dict:
    origin = geocode(origin_name)
    destination = geocode(destination_name)
    routes = get_alternative_routes(origin, destination)

    if len(routes) < 2:
        return {"alternate_available": False, "reason": "No alternate route found for this trip."}

    # Fast pass: rank every candidate using historical crash data + time-of-day
    # only (no weather/traffic/vision/news calls) — cheap enough to run on all
    # candidates so we know which ONE alternate is worth fully scoring.
    quick_scored = []
    for i, route in enumerate(routes):
        segments = score_route_quick(route["coordinates"])
        risk = route_quick_risk(segments)
        print(f"DEBUG quick route[{i}]: risk={risk} duration={route['duration_sec']/60:.1f}min")
        quick_scored.append({"risk": risk, "route": route})

    best_alt_quick = min(quick_scored[1:], key=lambda r: r["risk"])

    # Full pass: only the primary and the ONE best-looking alternate get the
    # slow, live-signal pipeline (weather/traffic/vision/news) — not every
    # candidate ORS handed back.
    waterlogging_points = load_waterlogging_points()
    vision_model = load_model("src/vision/best.pt")

    primary_segments = score_route(routes[0]["coordinates"], waterlogging_points, vision_model)
    alternate_segments = score_route(best_alt_quick["route"]["coordinates"], waterlogging_points, vision_model)

    primary_risk = route_total_risk(primary_segments)
    alternate_risk = route_total_risk(alternate_segments)

    risk_improvement = (primary_risk - alternate_risk) / primary_risk if primary_risk else 0
    time_increase = (best_alt_quick["route"]["duration_sec"] - routes[0]["duration_sec"]) / routes[0]["duration_sec"]

    print(f"DEBUG primary_risk={primary_risk} alt_risk={alternate_risk} "
          f"risk_improvement={risk_improvement:.2f} time_increase={time_increase:.2f}")

    should_suggest = risk_improvement >= RISK_IMPROVEMENT_THRESHOLD and time_increase <= MAX_ACCEPTABLE_TIME_INCREASE

    recommendation = (
        "A safer alternate route is available."
        if should_suggest
        else "The alternate route is not meaningfully safer — recommended to continue on the current route."
    )

    return {
        "alternate_available": True,
        "should_suggest_alternate": should_suggest,
        "recommendation": recommendation,
        "primary_risk": primary_risk,
        "alternate_risk": alternate_risk,
        "extra_time_minutes": round((best_alt_quick["route"]["duration_sec"] - routes[0]["duration_sec"]) / 60, 1),
        "alternate_segments": alternate_segments,
    }