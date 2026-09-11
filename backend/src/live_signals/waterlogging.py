import pandas as pd
from src.data_pipeline.segmentation import haversine_m

WATERLOGGING_RADIUS_M = 300

def load_waterlogging_points(path: str = "data/external/waterlogging_points.csv") -> pd.DataFrame:
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