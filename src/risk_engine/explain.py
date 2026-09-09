"""
explain.py
Owner: Umaima
Turns a scored segment into a plain-language explanation string.
"""


def generate_explanation(segment: dict) -> str:
    reasons = []

    hist = segment.get("historical_score", 0) or 0
    if hist >= 50:
        reasons.append("known high-risk stretch (strong historical pattern)")
    elif hist >= 20:
        reasons.append("some historical crash activity nearby")

    modifier = segment.get("time_pattern_modifier")
    if modifier and modifier >= 1.3:
        reasons.append("historically dangerous hour of day")

    weather = segment.get("weather_modifier")
    if weather:
        reasons.append(f"current weather: {weather}")

    if segment.get("waterlogging_flag"):
        reasons.append("near a known waterlogging point, currently raining")

    traffic = segment.get("traffic_level")
    if traffic and traffic in ("high", "severe"):
        reasons.append(f"{traffic} traffic congestion")

    vision = segment.get("vision_severity")
    if vision and vision != "none":
        reasons.append(f"{vision} road surface damage detected")

    news = segment.get("news_flags")
    if news:
        reasons.append("recent local news reported near this road")

    if not reasons:
        return "No significant risk factors detected for this segment."

    return "Risk factors: " + "; ".join(reasons) + "."