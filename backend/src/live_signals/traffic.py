import os
import requests
from dotenv import load_dotenv

load_dotenv()
TOMTOM_API_KEY = os.getenv("TOMTOM_API_KEY")

def get_traffic_level(lat: float, lon: float) -> str:
    url = "https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json"
    params = {"point": f"{lat},{lon}", "key": TOMTOM_API_KEY}
    response = requests.get(url, params=params, timeout=5)
    data = response.json().get("flowSegmentData", {})

    current = data.get("currentSpeed", 1)
    free_flow = data.get("freeFlowSpeed", 1)
    ratio = current / free_flow if free_flow else 1.0

    if ratio > 0.8: return "low"
    elif ratio > 0.5: return "medium"
    elif ratio > 0.25: return "high"
    return "severe"