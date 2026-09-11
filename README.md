# SafeRoute

# SafeRoute Telangana

An explainable, multi-signal road safety risk layer for everyday commutes in Hyderabad/Telangana — built as an AICW (AI Careers for Women) data science capstone project.

SafeRoute doesn't replace Google Maps' routing — it sits on top of a real route and scores each road segment for genuine risk by combining real historical crash data, live weather, live traffic, known waterlogging zones, AI-detected road surface damage, and live local news, then explains *why* a stretch is risky in plain language.

## Project Structure
SafeRoute/
├── backend/ # Python/FastAPI risk-scoring engine
│ ├── api/ # FastAPI web server (main.py)
│ ├── src/ # Core logic, organized by responsibility
│ │ ├── api_clients/ # Geocoding + routing (OpenRouteService)
│ │ ├── data_pipeline/ # Route segmentation
│ │ ├── risk_engine/ # Historical scoring, time patterns, fusion, explanations
│ │ ├── live_signals/ # Weather, traffic, waterlogging
│ │ ├── vision/ # YOLOv8 road damage detection
│ │ └── news/ # Live local news checks
│ ├── data/ # Datasets (external sources, processed crash data, raw files)
│ ├── docs/ # Schema, API contract, methodology notes
│ ├── tests/ # Pytest test suite
│ └── main.py # CLI entry point for running the pipeline directly
└── frontend/ # React + TypeScript web app


## Setup

### Backend
cd backend
python -m venv .venv
.venv\Scripts\activate # Windows
pip install -r requirements.txt

Create a `.env` file in `backend/` (copy from `.env.example`) with:
ORS_API_KEY=your_openrouteservice_key
TOMTOM_API_KEY=your_tomtom_key
MAPILLARY_TOKEN=your_mapillary_token

(All three are free, no credit card required — see docs/methodology.md for signup links.)

**Run the pipeline directly (CLI):**
python main.py


**Run the API server:**
python -m uvicorn api.main:app --reload
Test it interactively at `http://127.0.0.1:8000/docs`.

**Run tests:**
python -m pytest tests/

### Frontend
cd frontend
npm install
npm run dev

Runs at `http://localhost:5173` by default. Requires the backend API running at `http://127.0.0.1:8000` (see CORS setup in `api/main.py`).

## Data Sources
- Historical crashes: IIT Delhi "Media-Reported Road Traffic Crash Data" (Mendeley Data), filtered to Telangana
- Black spots: MoRTH Black Spot Management Information System (Telangana)
- Waterlogging zones: GHMC/HYDRAA published lists
- Weather: Open-Meteo
- Traffic: TomTom Traffic API
- Vision: YOLOv8 trained on RDD2022 (India subset), live imagery via Mapillary
- News: Google News RSS

## Known Limitations
See `docs/methodology.md` for a full, honest account of data limitations and design decisions made under real-world data constraints.

## Team
AICW Capstone — Umaima, Alizah, Zunairah, Shazia. Mentor: Mayuri Ma'am.