
"""
main.py
Owner: Umaima (integration owner)
"""

from datetime import datetime

from src.api_clients.geocode import geocode, reverse_geocode
from src.api_clients.maps_routing import get_route
from src.data_pipeline.segmentation import segment_route
from src.risk_engine.historical_score import load_black_spots, load_crash_data, score_all_segments
from src.risk_engine.time_pattern import build_daily_risk_profile, apply_time_modifier
from src.risk_engine.fusion import fuse_all_segments, route_total_risk
from src.news.news_check import get_news_flags, news_risk_score
from src.vision.detect import load_model
from src.vision.vision_pipeline import get_segment_vision_severity_multi
from src.live_signals.weather import get_weather_signal
from src.live_signals.traffic import get_traffic_signal
from src.live_signals.waterlogging import load_waterlogging_points, get_inundation_signal


def apply_real_weather_and_traffic(segment: dict, waterlogging_points) -> dict:
    lat, lon = segment["midpoint"]["lat"], segment["midpoint"]["lng"]
    segment.update(get_weather_signal(lat, lon))
    segment.update(get_traffic_signal(lat, lon))
    segment.update(get_inundation_signal(lat, lon, waterlogging_points, segment["weather_modifier"]))
    return segment


def apply_real_vision_and_news(segment: dict, vision_model) -> dict:
    severity, source, image_url = get_segment_vision_severity_multi(vision_model, segment["coordinates"])
    segment["vision_severity"] = severity
    segment["vision_source"] = source
    segment["vision_status"] = "live" if source == "mapillary" else "fallback" if source == "rdd2022_sample" else "unavailable"
    segment["image_url"] = image_url
    segment["news_flags"] = get_news_flags(segment["road_name"])
    segment["news_status"] = "live" if segment["news_flags"] else "no_relevant_reports"
    segment["news_risk_score"] = news_risk_score(segment["road_name"])
    return segment


def score_route(route_coordinates, waterlogging_points, vision_model):
    """Takes raw route coordinates, returns fully scored segments. Reusable for any route."""
    segments = segment_route(route_coordinates, segment_length_m=500)
    for seg in segments:
        seg["road_name"] = reverse_geocode(seg["midpoint"]["lat"], seg["midpoint"]["lng"])

    black_spots = load_black_spots()
    crashes = load_crash_data()
    segments = score_all_segments(segments, black_spots, crashes)

    daily_profile = build_daily_risk_profile(crashes)
    current_day = datetime.now().strftime("%A")
    segments = [apply_time_modifier(s, current_day, daily_profile) for s in segments]

    segments = [apply_real_weather_and_traffic(s, waterlogging_points) for s in segments]
    segments = [apply_real_vision_and_news(s, vision_model) for s in segments]

    return fuse_all_segments(segments)


def run_pipeline(origin_name: str, destination_name: str):
    print(f"\nGeocoding: {origin_name} -> {destination_name}")
    origin = geocode(origin_name)
    destination = geocode(destination_name)

    print("Fetching route...")
    route = get_route(origin, destination)

    waterlogging_points = load_waterlogging_points()

    print("Loading vision model (one-time, may take a moment)...")
    vision_model = load_model("src/vision/best.pt")

    print("Scoring route...")
    segments = score_route(route["coordinates"], waterlogging_points, vision_model)

    print(f"\nRoute total risk score: {route_total_risk(segments)}/100\n")
    for s in segments:
        print(f"Segment {s['segment_id']} | Road: {s['road_name']} | Score: {s['final_score']}/100")
        print(f"  -> {s['explanation']} (vision source: {s['vision_source']})\n")

    return segments


if __name__ == "__main__":
    run_pipeline("Ameerpet, Hyderabad", "Secunderabad, Hyderabad")
    run_pipeline("Gachibowli, Hyderabad", "Kukatpally, Hyderabad")
