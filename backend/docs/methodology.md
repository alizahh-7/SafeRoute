- Crash dataset: IIT Delhi "Media-Reported Road Traffic Crash Data" (Mendeley), filtered to Telangana = 114 of 2,898 national rows. No hour data available, only day-of-week — adapted time_pattern.py accordingly.
- Severity = killed*5 + injured*1 (weighting fatalities heavier), no direct severity column existed in source data.
- Black spot data: currently placeholder/sample, pending Shazia's MoRTH extract.
- Road names: reverse-geocoded via Nominatim (OpenStreetMap), since Google Maps was replaced with OpenRouteService which doesn't return place names.
- Historical black-spot signal on the Malakpet-Khairatabad demo corridor is currently driven by a single proximate data point (central Hyderabad district aggregate), not multiple distinct verified spots. Stated as a known limitation given data availability, not treated as a deeply validated result.
- All live signals (weather, traffic, waterlogging, vision, news) are now real,no mocked data remains in the pipeline as of [date].
- Built weather.py, traffic.py, waterlogging.py in-house (src/live_signals/) using Open-Meteo and TomTom Traffic APIs, since teammate delivery was delayed.
- Data quality issues encountered and handled defensively: BOM characters, mixed encodings (cp1252/latin-1), malformed coordinate ranges in source CSVs 
  — loader functions now validate and drop bad rows with visible warnings rather than crashing.