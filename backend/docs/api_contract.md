POST http://127.0.0.1:8000/route-risk
Body: {"origin": "place name", "destination": "place name"}
Returns: {"route_total_risk": number, "segments": [ ...full segment objects... ]}
"vision_source": "mapillary",  // already exists
"image_url": null              // NEW — needs adding to vision_pipeline.py's return value