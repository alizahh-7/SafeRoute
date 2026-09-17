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

MAX_RETRIES = 4
BASE_DELAY = 1.5


def _request_with_retry(url: str, params: dict) -> dict:
    """Wraps a Nominatim GET with exponential backoff on 429 / transient errors."""
    last_error = None
    for attempt in range(MAX_RETRIES):
        try:
            response = requests.get(url, params=params, headers=HEADERS, timeout=8)
            if response.status_code == 429:
                wait = BASE_DELAY * (2 ** attempt)
                print(f"Nominatim 429 rate-limited, retrying in {wait}s (attempt {attempt + 1}/{MAX_RETRIES})")
                time.sleep(wait)
                continue
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as error:
            last_error = error
            wait = BASE_DELAY * (2 ** attempt)
            print(f"Nominatim request failed ({error}), retrying in {wait}s")
            time.sleep(wait)
    print(f"Nominatim request failed after {MAX_RETRIES} attempts: {last_error}")
    return {}


def _search(query: str, limit: int = 1) -> list[dict]:
    params = {
        "q": query,
        "format": "json",
        "limit": limit,
        "viewbox": HYDERABAD_VIEWBOX,
        "bounded": 0,
        "addressdetails": 1,
    }
    result = _request_with_retry(NOMINATIM_URL, params)
    return result if isinstance(result, list) else []


def geocode(place_name: str) -> tuple[float, float]:
    results = _search(place_name)

    if not results and "hyderabad" not in place_name.lower():
        # Retry with city/state appended â€” helps with POI names Nominatim
        # doesn't recognise on their own (e.g. "malakpet metro station")
        results = _search(f"{place_name}, Hyderabad, Telangana, India")

    if not results:
        raise ValueError(
            f"Could not find '{place_name}'. Try a nearby landmark or add the area name."
        )

    lat = float(results[0]["lat"])
    lon = float(results[0]["lon"])
    time.sleep(1.2)
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
    time.sleep(1.2)
    return suggestions


def reverse_geocode(lat: float, lon: float) -> str:
    url = "https://nominatim.openstreetmap.org/reverse"
    params = {"lat": lat, "lon": lon, "format": "json"}
    data = _request_with_retry(url, params)

    address = data.get("address", {}) if isinstance(data, dict) else {}
    name = (
        address.get("road") or address.get("suburb")
        or address.get("neighbourhood") or address.get("village")
        or data.get("display_name", "Unnamed segment")
    )
    time.sleep(1.2)
    return name