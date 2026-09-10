"""
time_pattern.py
Owner: Umaima

Real dataset has no hour column — only day of week. So this now matches
current day of week against historical severity patterns instead of hour.
"""

import pandas as pd
from datetime import datetime


def build_daily_risk_profile(crashes: pd.DataFrame) -> dict:
    """Returns a multiplier per day of week, e.g. {"friday": 1.4, "monday": 0.8, ...}"""
    if crashes.empty or "day_of_week" not in crashes.columns:
        return {}

    avg_severity = crashes["severity"].mean()
    profile = {}
    for day, group in crashes.groupby("day_of_week"):
        profile[day] = round(group["severity"].mean() / avg_severity, 2) if avg_severity else 1.0
    return profile


def apply_time_modifier(segment: dict, current_day: str, daily_profile: dict) -> dict:
    multiplier = daily_profile.get(current_day.lower(), 1.0)
    segment["time_pattern_modifier"] = multiplier
    if segment["historical_score"] is not None:
        segment["historical_score"] = round(min(segment["historical_score"] * multiplier, 100.0), 1)
    return segment