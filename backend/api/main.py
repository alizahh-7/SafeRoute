"""
api/main.py
The actual web server the frontend calls. Reuses the exact same pipeline
logic as the root main.py — no duplicated code.
"""

from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from main import run_pipeline
from src.risk_engine.fusion import route_total_risk
from src.routing.alt_route import suggest_safer_route
from src.api_clients.geocode import geocode, get_location_suggestions, reverse_geocode
from src.news.news_check import get_news_flags

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite's default dev port
    allow_methods=["*"],
    allow_headers=["*"],
)

class RouteRequest(BaseModel):
    origin: str
    destination: str


@app.post("/route-risk")
def get_route_risk(req: RouteRequest):
    segments = run_pipeline(req.origin, req.destination)
    return {
        "route_total_risk": route_total_risk(segments),
        "segments": segments,
    }
    
@app.post("/alternate-route")
def get_alternate_route(req: RouteRequest):
    return suggest_safer_route(req.origin, req.destination)

@app.get("/location-suggestions")
def location_suggestions(q: str):
    return {"suggestions": get_location_suggestions(q)}

@app.get("/reverse-geocode")
def reverse_geocode_endpoint(lat: float, lon: float):
    return {"label": reverse_geocode(lat, lon)}

@app.get("/city-news")
def city_news():
    flags = get_news_flags("Hyderabad")
    return {"headlines": flags or []}