import pandas as pd
from pathlib import Path
from src.data_pipeline.segmentation import haversine_m

WATERLOGGING_RADIUS_M = 300

DEFAULT_POINTS_PATH = Path(__file__).resolve().parents[2] / "data" / "external" / "waterlogging_points.csv"

def load_waterlogging_points(path: str | Path = DEFAULT_POINTS_PATH) -> pd.DataFrame:
    for encoding in ["utf-8-sig", "cp1252", "latin-1"]:
        try:
            return pd.read_csv(path, encoding=encoding)
        except UnicodeDecodeError:
            continue
    raise ValueError(f"Could not read {path} with any known encoding")

def is_near_waterlogging_point(lat: float, lon: float, points: pd.DataFrame) -> bool:
    for _, row in points.iterrows():
        if haversine_m((lat, lon), (row["latitude"], row["longitude"])) <= WATERLOGGING_RADIUS_M:
            return True
    return False


def get_inundation_signal(lat: float, lon: float, points: pd.DataFrame, weather_modifier: int) -> dict:
    if points.empty:
        return {"waterlogging_flag": False, "inundation_status": "dataset_unavailable"}
    nearest = min(
        haversine_m((lat, lon), (row["latitude"], row["longitude"]))
        for _, row in points.iterrows()
    )
    return {
        "waterlogging_flag": weather_modifier >= 10 and nearest <= WATERLOGGING_RADIUS_M,
        "inundation_status": "monitored",
        "nearest_inundation_point_m": round(nearest),
    }
