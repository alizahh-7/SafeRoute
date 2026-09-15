import os
from pathlib import Path
import requests
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[3] / ".env")
TOMTOM_API_KEY = os.getenv("TOMTOM_API_KEY")

def get_traffic_signal(lat: float, lon: float) -> dict:
    if not TOMTOM_API_KEY:
        return {"traffic_level": "unavailable", "traffic_status": "unavailable"}
    url = "https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json"
    params = {"point": f"{lat},{lon}", "key": TOMTOM_API_KEY}
    try:
        response = requests.get(url, params=params, timeout=5)
        response.raise_for_status()
        data = response.json().get("flowSegmentData", {})
        current = float(data["currentSpeed"])
        free_flow = float(data["freeFlowSpeed"])
        if current < 0 or free_flow <= 0:
            raise ValueError("Invalid traffic speed data")
    except (requests.exceptions.RequestException, KeyError, TypeError, ValueError):
        return {"traffic_level": "unavailable", "traffic_status": "unavailable"}

    ratio = current / free_flow
    if ratio > 0.8: level = "low"
    elif ratio > 0.5: level = "medium"
    elif ratio > 0.25: level = "high"
    else: level = "severe"
    return {"traffic_level": level, "traffic_status": "live", "traffic_current_speed_kmh": round(current, 1), "traffic_free_flow_speed_kmh": round(free_flow, 1), "traffic_flow_ratio": round(ratio, 2)}


def get_traffic_level(lat: float, lon: float) -> str:
    """Compatibility wrapper for existing callers and tests."""
    return get_traffic_signal(lat, lon)["traffic_level"]
