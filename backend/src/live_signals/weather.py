import requests

def get_weather_modifier(lat: float, lon: float) -> int:
    url = "https://api.open-meteo.com/v1/forecast"
    params = {"latitude": lat, "longitude": lon, "current": "precipitation,wind_speed_10m,visibility"}
    response = requests.get(url, params=params, timeout=5)
    data = response.json().get("current", {})

    precipitation = data.get("precipitation", 0)
    wind_speed = data.get("wind_speed_10m", 0)

    if precipitation > 5 or wind_speed > 40:
        return 20
    elif precipitation > 0.5 or wind_speed > 25:
        return 10
    return 0