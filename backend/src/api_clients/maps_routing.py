"""
maps_routing.py
Owner: Umaima

Fetches a route using OpenRouteService instead of Google Maps.
ORS needs COORDINATES, not place names — call geocode.py first.
Note: ORS returns coordinates as [lon, lat] (GeoJSON order) — we flip
them to (lat, lon) here so the rest of the pipeline never has to think
about this again.
"""

import os
import requests
from dotenv import load_dotenv

load_dotenv()
ORS_API_KEY = os.getenv("ORS_API_KEY")
ORS_URL = "https://api.openrouteservice.org/v2/directions/driving-car/geojson"


def get_route(origin_coords: tuple[float, float], destination_coords: tuple[float, float],
              alternatives: bool = False) -> dict:
    """
    origin_coords / destination_coords: (lat, lon) tuples — get these from geocode.py first.
    """
    if not ORS_API_KEY:
        raise EnvironmentError("ORS_API_KEY not found. Check your .env file.")

    headers = {
        "Authorization": ORS_API_KEY,
        "Content-Type": "application/json",
    }

    body = {
        # ORS wants [lon, lat] order — flipping our (lat, lon) tuples here
        "coordinates": [
            [origin_coords[1], origin_coords[0]],
            [destination_coords[1], destination_coords[0]],
        ]
    }

    if alternatives:
        body["alternative_routes"] = {"target_count": 2, "share_factor": 0.6, "weight_factor": 1.4}

    response = requests.post(ORS_URL, json=body, headers=headers)
    if response.status_code != 200:
        raise ValueError(f"ORS error {response.status_code}: {response.text}")

    data = response.json()
    if not data.get("features"):
        raise ValueError("No route found")

    route = data["features"][0]
    coords_lonlat = route["geometry"]["coordinates"]
    coords_latlon = [(lat, lon) for lon, lat in coords_lonlat]  # flip back to our convention

    segment_info = route["properties"]["segments"][0]

    return {
        "coordinates": coords_latlon,          # replaces the old "polyline" field
        "distance_m": segment_info["distance"],
        "duration_sec": segment_info["duration"],  # NOTE: this is NOT live-traffic-aware —
                                                     # that's what TomTom is for, added separately
    }


if __name__ == "__main__":
    from src.api_clients.geocode import geocode
    origin = geocode("Malakpet, Hyderabad")
    destination = geocode("Khairatabad, Hyderabad")
    route = get_route(origin, destination)
    print(f"Distance: {route['distance_m']} m")
    print(f"Duration (no live traffic yet): {route['duration_sec'] / 60:.1f} min")