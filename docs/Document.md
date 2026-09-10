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

---

## Vision Module — Enhancements (Phase 2 extension)

**Severity scoring upgrade:** severity_from_detections() was upgraded from a 
simple confidence/count threshold to a weighted formula combining detection 
confidence, bounding box size relative to the image (larger box = closer/more 
severe damage), and class-specific risk weighting (pothole weighted highest, 
cracks lower). This gives a more defensible, realistic severity signal than 
confidence alone.

**Precision-recall analysis:** ran a threshold sweep (conf 0.1 to 0.6) against 
the validation set to understand the model's precision/recall tradeoff, rather 
than reporting a single confidence-threshold number. Chart saved as 
precision_recall_curve.png. This confirmed the model holds meaningfully more 
detections at lower confidence thresholds (e.g. 15 detections at conf=0.1 vs. 
5 at conf=0.25 across a 5-image sample) — a real, usable tuning lever, not 
just a limitation.

**Targeted data augmentation:** built augment_data.py to specifically oversample 
the transverse crack class (previously only ~300 training instances, the 
weakest-performing class at mAP50=0.187). Applies brightness variation to 
create additional training examples before a retraining pass, directly 
addressing a documented data-scarcity limitation rather than just noting it.

**Live street imagery integration (Mapillary):** built vision_pipeline.py to 
fetch a real street-level photo near any segment's coordinates via the 
Mapillary API (free, crowd-sourced street imagery), running detection on the 
live photo when available. Falls back to a representative RDD2022 test image 
when no street coverage exists for a given location (documented, not hidden — 
image_source is logged as "mapillary" or "rdd2022_sample" per segment).

## News Module — Enhancements (Phase 2 extension)

**Urgency classification:** news headlines are now classified as high urgency 
(accidents, flooding, closures) vs. low urgency (planned roadwork, diversions) 
rather than treated as a flat "relevant or not" signal — richer input for 
reroute decision-making.

**Recency weighting:** headlines are weighted by how recent they are (a 24-hour 
half-life decay), so a 2-hour-old accident report is treated as more relevant 
than a 40-hour-old one, instead of all matching headlines being weighted equally.

Note: these two richer functions (get_news_flags_weighted) are kept separate 
from the schema-facing get_news_flags() function that feeds Umaima's fusion 
engine — used for frontend display and report depth without altering the 
frozen news_flags contract.

## Files (updated)

- src/vision/detect.py — inference + weighted severity rating
- src/vision/vision_pipeline.py — Mapillary live imagery + RDD2022 fallback, ties detection to segment coordinates
- src/vision/augment_data.py — targeted transverse-crack data augmentation
- src/news/news_check.py — schema-facing news_flags function + urgency/recency bonus layer

