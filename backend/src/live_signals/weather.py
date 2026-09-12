import requests

def get_weather_modifier(lat: float, lon: float) -> int:
    url = "https://api.open-meteo.com/v1/forecast"
    params = {"latitude": lat, "longitude": lon, "current": "precipitation,wind_speed_10m,visibility"}
    try:
        response = requests.get(url, params=params, timeout=8)
        response.raise_for_status()
        data = response.json().get("current", {})
    except requests.exceptions.RequestException:
        return 0  # fail safe: treat as clear weather rather than crashing the whole pipeline

    precipitation = data.get("precipitation", 0)
    wind_speed = data.get("wind_speed_10m", 0)

    if precipitation > 5 or wind_speed > 40:
        return 20
    elif precipitation > 0.5 or wind_speed > 25:
        return 10
    return 0