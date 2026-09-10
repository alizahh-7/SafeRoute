import pandas as pd
from src.data_pipeline.segmentation import segment_route, haversine_m
from src.risk_engine.historical_score import compute_historical_score, load_black_spots, load_crash_data
from src.risk_engine.fusion import fuse_segment_risk
from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)

def test_haversine_distance_is_positive():
    d = haversine_m((17.371, 78.499), (17.375, 78.495))
    assert d > 0


def test_segment_route_creates_segments():
    points = [(17.371, 78.499), (17.375, 78.495), (17.380, 78.490), (17.390, 78.480)]
    segments = segment_route(points, segment_length_m=300)
    assert len(segments) > 0
    assert "segment_id" in segments[0]


def test_historical_score_near_black_spot_is_high():
    black_spots = load_black_spots()
    crashes = load_crash_data()
    segment = {"midpoint": {"lat": 17.3725, "lng": 78.4980}}
    score = compute_historical_score(segment, black_spots, crashes)
    assert score > 30


def test_fusion_combines_signals_correctly():
    segment = {
        "segment_id": "test1",
        "historical_score": 40,
        "time_pattern_modifier": 1.0,
        "weather_modifier": 10,
        "traffic_level": "high",
        "waterlogging_flag": True,
        "vision_severity": "moderate",
        "news_flags": None,
    }
    result = fuse_segment_risk(segment)
    assert result["final_score"] > segment["historical_score"]
    assert isinstance(result["explanation"], str)
    
def test_route_risk_endpoint_returns_valid_response():
    response = client.post("/route-risk", json={
        "origin": "Malakpet, Hyderabad",
        "destination": "Khairatabad, Hyderabad"
    })
    assert response.status_code == 200
    data = response.json()
    assert "route_total_risk" in data
    assert len(data["segments"]) > 0
    assert "final_score" in data["segments"][0]