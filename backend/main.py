"""
main.py
Owner: Umaima (integration owner)
"""

import random
from datetime import datetime

from src.api_clients.geocode import geocode, reverse_geocode
from src.api_clients.maps_routing import get_route
from src.data_pipeline.segmentation import segment_route
from src.risk_engine.historical_score import load_black_spots, load_crash_data, score_all_segments
from src.risk_engine.time_pattern import build_daily_risk_profile, apply_time_modifier
from src.risk_engine.fusion import fuse_all_segments, route_total_risk


def mock_weather_and_traffic(segment: dict) -> dict:
    segment["weather_modifier"] = random.choice([0, 0, 10, 20])
    segment["traffic_level"] = random.choice(["low", "medium", "high"])
    segment["waterlogging_flag"] = random.random() < 0.15
    return segment


def mock_vision_and_news(segment: dict) -> dict:
    segment["vision_severity"] = random.choice(["none", "none", "minor", "moderate"])
    segment["news_flags"] = None if random.random() > 0.1 else ["Reported waterlogging near this area"]
    return segment


def run_pipeline(origin_name: str, destination_name: str):
    print(f"\nGeocoding: {origin_name} -> {destination_name}")
    origin = geocode(origin_name)
    destination = geocode(destination_name)

    print("Fetching route...")
    route = get_route(origin, destination)

    segments = segment_route(route["coordinates"], segment_length_m=500)
    print(f"Route split into {len(segments)} segments")
    print("Reverse-geocoding segment names (this takes a few seconds)...")
    for seg in segments:
        seg["road_name"] = reverse_geocode(seg["midpoint"]["lat"], seg["midpoint"]["lng"])

    black_spots = load_black_spots()
    crashes = load_crash_data()
    segments = score_all_segments(segments, black_spots, crashes)
    
    daily_profile = build_daily_risk_profile(crashes)
    current_day = datetime.now().strftime("%A")
    segments = [apply_time_modifier(s, current_day, daily_profile) for s in segments]

    segments = [mock_weather_and_traffic(s) for s in segments]
    segments = [mock_vision_and_news(s) for s in segments]

    segments = fuse_all_segments(segments)

    print(f"\nRoute total risk score: {route_total_risk(segments)}/100\n")
    for s in segments:
        print(f"Segment {s['segment_id']} | Road: {s['road_name']} | Score: {s['final_score']}/100")
        print(f"  -> {s['explanation']}\n")

    return segments


if __name__ == "__main__":
    run_pipeline("Malakpet, Hyderabad", "Khairatabad, Hyderabad")