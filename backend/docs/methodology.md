- Crash dataset: IIT Delhi "Media-Reported Road Traffic Crash Data" (Mendeley), 
  filtered to Telangana = 114 of 2,898 national rows. No hour data available, 
  only day-of-week — adapted time_pattern.py accordingly.
- Severity = killed*5 + injured*1 (weighting fatalities heavier), no direct 
  severity column existed in source data.
- Black spot data: currently placeholder/sample, pending Shazia's MoRTH extract.
- Road names: reverse-geocoded via Nominatim (OpenStreetMap), since Google Maps 
  was replaced with OpenRouteService which doesn't return place names.