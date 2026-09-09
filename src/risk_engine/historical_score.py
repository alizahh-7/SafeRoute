"""
historical_score.py
Owner: Umaima

Computes a base 0-100 historical risk score per segment using:
1. Proximity to known MoRTH Black Spots  (data/external/black_spots.csv)
2. Density of nearby historical crashes  (data/processed/telangana_crashes.csv)

Expected black_spots.csv columns:
    location_name, latitude, longitude, yearly_accident_count

Expected telangana_crashes.csv columns:
    crash_id, latitude, longitude, date, hour, severity   (severity: 1=minor .. 5=fatal)
"""

import pandas as pd
from src.data_pipeline.segmentation import haversine_m

BLACK_SPOT_RADIUS_M = 400
CRASH_RADIUS_M = 300


def load_black_spots(path: str = "data/external/black_spots.csv") -> pd.DataFrame:
    return pd.read_csv(path)


def load_crash_data(path: str = "data/processed/telangana_crashes.csv") -> pd.DataFrame:
    return pd.read_csv(path)


def _nearby_black_spot_score(midpoint: dict, black_spots: pd.DataFrame) -> float:
    if black_spots.empty:
        return 0.0
    best_score = 0.0
    for _, row in black_spots.iterrows():
        dist = haversine_m((midpoint["lat"], midpoint["lng"]), (row["latitude"], row["longitude"]))
        if dist <= BLACK_SPOT_RADIUS_M:
            proximity_factor = 1 - (dist / BLACK_SPOT_RADIUS_M)
            severity_factor = min(row["yearly_accident_count"], 50) / 50
            score = 100 * proximity_factor * severity_factor
            best_score = max(best_score, score)
    return best_score


def _crash_density_score(midpoint: dict, crashes: pd.DataFrame) -> float:
    if crashes.empty:
        return 0.0
    nearby = crashes[
        crashes.apply(
            lambda r: haversine_m((midpoint["lat"], midpoint["lng"]), (r["latitude"], r["longitude"])) <= CRASH_RADIUS_M,
            axis=1,
        )
    ]
    if nearby.empty:
        return 0.0
    weighted_sum = nearby["severity"].sum()
    return min(100.0, weighted_sum * 8)


def compute_historical_score(segment: dict, black_spots: pd.DataFrame, crashes: pd.DataFrame) -> float:
    bs_score = _nearby_black_spot_score(segment["midpoint"], black_spots)
    crash_score = _crash_density_score(segment["midpoint"], crashes)
    combined = 0.6 * bs_score + 0.4 * crash_score
    return round(min(combined, 100.0), 1)


def score_all_segments(segments: list[dict], black_spots: pd.DataFrame, crashes: pd.DataFrame) -> list[dict]:
    for seg in segments:
        seg["historical_score"] = compute_historical_score(seg, black_spots, crashes)
    return segments