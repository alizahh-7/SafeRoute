"""
geocode.py
Owner: Umaima

Converts a place name (e.g. "Malakpet, Hyderabad") into (lat, lon) using
OpenStreetMap's free Nominatim service. No API key needed — just a
required "User-Agent" header per their usage policy, and don't hammer it
faster than ~1 request/second.
"""

import requests
import time

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
HEADERS = {"User-Agent": "SafeRouteTelangana-AICW-Capstone (student project)"}


def geocode(place_name: str) -> tuple[float, float]:
    params = {"q": place_name, "format": "json", "limit": 1}
    response = requests.get(NOMINATIM_URL, params=params, headers=HEADERS)
    response.raise_for_status()
    results = response.json()

    if not results:
        raise ValueError(f"Could not geocode '{place_name}'")

    lat = float(results[0]["lat"])
    lon = float(results[0]["lon"])
    time.sleep(1)  # be polite to the free service — avoid rate-limit blocks
    return (lat, lon)

def reverse_geocode(lat: float, lon: float) -> str:
    """
    Converts coordinates back into a readable place/road name using Nominatim.
    Falls back gracefully through road -> suburb -> neighbourhood -> generic label.
    """
    url = "https://nominatim.openstreetmap.org/reverse"
    params = {"lat": lat, "lon": lon, "format": "json"}
    response = requests.get(url, params=params, headers=HEADERS)
    response.raise_for_status()
    data = response.json()

    address = data.get("address", {})
    name = (
        address.get("road")
        or address.get("suburb")
        or address.get("neighbourhood")
        or address.get("village")
        or data.get("display_name", "Unnamed segment")
    )
    time.sleep(1)  # same rate-limit courtesy as forward geocoding
    return name


if __name__ == "__main__":
    print(geocode("Malakpet, Hyderabad"))
    print(geocode("Khairatabad, Hyderabad"))