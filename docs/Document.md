# Vision & News Modules — Zunairah

## Vision Module (Road Damage Detection)

**Model:** YOLOv8s, fine-tuned on RDD2022 India subset
**Dataset:** RDD2022 (Kaggle mirror), filtered to India-prefixed images only
- Train: 5,368 images
- Val: 1,172 images
- Test: 1,166 images

**Training config:** 50 epochs, imgsz=640, batch=16, optimizer=AdamW (auto)

**Classes:** longitudinal crack, transverse crack, alligator crack, other corruption, pothole

**Results (final, v2):**

| Class | mAP50 | Precision | Recall |
|---|---|---|---|
| Overall | 0.404 | 0.530 | 0.374 |
| Longitudinal crack | 0.284 | 0.473 | 0.296 |
| Transverse crack | 0.187 | 0.448 | 0.091 |
| Alligator crack | 0.646 | 0.593 | 0.616 |
| Other corruption | 0.468 | 0.555 | 0.480 |
| Pothole | 0.437 | 0.582 | 0.385 |

**Known limitation:** RDD2022 is a multi-national dataset; the India subset is
India-wide, not Hyderabad-specific — road/damage patterns may not perfectly
match Hyderabad conditions. Transverse crack has very low support in
validation (11 instances), so that class's metrics are not reliable and
should be treated as a documented data-scarcity limitation, not a model
failure.

**Files:**
- `src/vision/train.py` — training pipeline (dataset filtering + YOLOv8 training)
- `src/vision/detect.py` — inference + severity rating for a single image
- `src/vision/best.pt` — trained model weights

## News Awareness Module

Checks Google News RSS for recent (road-related) news per area name, and
returns a route-level flag for whether to prompt the user to reroute.

Tested against real Hyderabad areas (Ameerpet, Gachibowli, Kukatpally) with
live results, and against an empty-news case to confirm the clean "no news"
state works correctly.

**Files:**
- `src/news/news_check.py` — fetch + relevance-filter + reroute-flag logic

## Still needed from Umaima

- Frozen JSON schema — exact field names for segment_id, coordinates, and
  road/area name
- Confirmation of what "road/area name" looks like coming out of her
  segmentation (locality name vs. road name vs. coordinates only)
'@ | Out-File -FilePath docs\vision-and-news-modules.md -Encoding utf8
