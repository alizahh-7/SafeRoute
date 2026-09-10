import pandas as pd

df = pd.read_excel("news_crashes.xlsx")

# Strip trailing/leading spaces from all column names — fixes the "Month " issue
df.columns = df.columns.str.strip()

print("CLEANED COLUMN NAMES:")
print(df.columns.tolist())

telangana_df = df[df["State"] == "Telangana"]

print(f"\nTelangana rows: {len(telangana_df)}")
print("\nSAMPLE TELANGANA ROWS (Location, Million Plus City, LatLong, Killed, Injured, Crash Day):")
print(telangana_df[["Location", "Million Plus City", "LatLong", "Killed", "Injured", "Crash Day"]].head(15))

print("\nHOW MANY HAVE A NON-EMPTY LatLong:")
print(telangana_df["LatLong"].notna().sum(), "out of", len(telangana_df))

print("\nHOW MANY ARE IN HYDERABAD SPECIFICALLY (Million Plus City):")
print(telangana_df["Million Plus City"].value_counts(dropna=False))