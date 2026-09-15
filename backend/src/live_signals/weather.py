import requests


def get_weather_signal(lat: float, lon: float) -> dict:
    url = "https://api.open-meteo.com/v1/forecast"
    params = {"latitude": lat, "longitude": lon, "current": "precipitation,wind_speed_10m,visibility"}
    try:
        response = requests.get(url, params=params, timeout=8)
        response.raise_for_status()
        data = response.json().get("current", {})
    except (requests.exceptions.RequestException, TypeError, ValueError):
        return {"weather_modifier": 0, "weather_status": "unavailable"}

    precipitation = data.get("precipitation", 0)
    wind_speed = data.get("wind_speed_10m", 0)

    if precipitation > 5 or wind_speed > 40:
        modifier = 20
    elif precipitation > 0.5 or wind_speed > 25:
        modifier = 10
    else:
        modifier = 0
    return {
        "weather_modifier": modifier,
        "weather_status": "live",
        "weather_precipitation_mm": precipitation,
        "weather_wind_kmh": wind_speed,
        "weather_visibility_m": data.get("visibility"),
    }


def get_weather_modifier(lat: float, lon: float) -> int:
    """Compatibility wrapper for existing callers and tests."""
    return get_weather_signal(lat, lon)["weather_modifier"]
