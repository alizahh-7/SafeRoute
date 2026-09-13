"""
geocode.py
Owner: Umaima
"""

import requests
import time

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
HEADERS = {"User-Agent": "SafeRouteTelangana-AICW-Capstone (student project)"}

# Rough bounding box around Hyderabad, used to bias (not restrict) results
HYDERABAD_VIEWBOX = "78.20,17.60,78.75,17.20"  # left,top,right,bottom


def _search(query: str, limit: int = 1) -> list[dict]:
    params = {
        "q": query,
        "format": "json",
        "limit": limit,
        "viewbox": HYDERABAD_VIEWBOX,
        "bounded": 0,
        "addressdetails": 1,
    }
    response = requests.get(NOMINATIM_URL, params=params, headers=HEADERS, timeout=8)
    response.raise_for_status()
    return response.json()


def geocode(place_name: str) -> tuple[float, float]:
    results = _search(place_name)

    if not results and "hyderabad" not in place_name.lower():
        # Retry with city/state appended — helps with POI names Nominatim
        # doesn't recognise on their own (e.g. "malakpet metro station")
        results = _search(f"{place_name}, Hyderabad, Telangana, India")

    if not results:
        raise ValueError(
            f"Could not find '{place_name}'. Try a nearby landmark or add the area name."
        )

    lat = float(results[0]["lat"])
    lon = float(results[0]["lon"])
    time.sleep(1)
    return (lat, lon)


def get_location_suggestions(query: str, limit: int = 5) -> list[dict]:
    """Autocomplete suggestions, biased toward Hyderabad/Telangana."""
    if len(query.strip()) < 3:
        return []
    results = _search(f"{query}, Telangana", limit=limit) or _search(query, limit=limit)
    suggestions = [
        {"label": r.get("display_name", query), "lat": float(r["lat"]), "lon": float(r["lon"])}
        for r in results
    ]
    time.sleep(1)
    return suggestions


def reverse_geocode(lat: float, lon: float) -> str:
    url = "https://nominatim.openstreetmap.org/reverse"
    params = {"lat": lat, "lon": lon, "format": "json"}
    response = requests.get(url, params=params, headers=HEADERS)
    response.raise_for_status()
    data = response.json()
    address = data.get("address", {})
    name = (
        address.get("road") or address.get("suburb")
        or address.get("neighbourhood") or address.get("village")
        or data.get("display_name", "Unnamed segment")
    )
    time.sleep(1)
    return name