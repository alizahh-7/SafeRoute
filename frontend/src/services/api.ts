//frontend/src/services/api.ts

import type { RouteRiskResponse, AlternateRouteResponse } from "../types/route";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = "ApiError";
  }
}

export const fetchRoute = async (
  origin: string,
  destination: string
): Promise<RouteRiskResponse> => {
  const response = await fetch(`${API_BASE_URL}/route-risk`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ origin, destination }),
  });

  if (!response.ok) {
    throw new ApiError(
      `Failed to fetch route risk (${response.status}). Check that the backend is running.`,
      response.status
    );
  }

  return response.json();
};

export const fetchAlternateRoute = async (
  origin: string,
  destination: string
): Promise<AlternateRouteResponse> => {
  const response = await fetch(`${API_BASE_URL}/alternate-route`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ origin, destination }),
  });

  if (!response.ok) {
    throw new ApiError(
      `Failed to fetch alternate route (${response.status}). Check that the backend is running.`,
      response.status
    );
  }

  return response.json();
};