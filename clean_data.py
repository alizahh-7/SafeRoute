import pandas as pd

df = pd.read_excel("news_crashes.xlsx")
df.columns = df.columns.str.strip()

telangana_df = df[df["State"] == "Telangana"].copy()

# Split "17.69, 77.62" into two real numeric columns
latlong_split = telangana_df["LatLong"].str.split(",", expand=True)
telangana_df["latitude"] = latlong_split[0].astype(float)
telangana_df["longitude"] = latlong_split[1].astype(float)

# Combine Killed + Injured into one severity score.
# Weighting deaths much heavier than injuries — tune this later if needed.
telangana_df["killed"] = telangana_df["Killed"].fillna(0)
telangana_df["injured"] = telangana_df["Injured"].fillna(0)
telangana_df["severity"] = telangana_df["killed"] * 5 + telangana_df["injured"] * 1

# Keep day of week as-is, lowercase for consistent matching later
telangana_df["day_of_week"] = telangana_df["Crash Day"].str.strip().str.lower()

final_df = telangana_df.rename(columns={"S. No.": "crash_id", "Crash Date": "date"})[
    ["crash_id", "latitude", "longitude", "date", "day_of_week", "killed", "injured", "severity"]
]

final_df.to_csv("data/processed/telangana_crashes.csv", index=False)
print(f"Saved {len(final_df)} Telangana crash records to data/processed/telangana_crashes.csv")
print(final_df.head())