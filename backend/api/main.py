"""
api/main.py
The actual web server the frontend calls. Reuses the exact same pipeline
logic as the root main.py — no duplicated code.
"""

from fastapi import FastAPI
from pydantic import BaseModel

from main import run_pipeline
from src.risk_engine.fusion import route_total_risk

app = FastAPI()


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