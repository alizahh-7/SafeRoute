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