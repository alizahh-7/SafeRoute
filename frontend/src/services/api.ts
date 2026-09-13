//frontend/src/services/api.ts

import type { RouteRiskResponse, AlternateRouteResponse } from "../types/route";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
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

export interface LocationSuggestion { label: string; lat: number; lon: number; }

export const fetchLocationSuggestions = async (query: string): Promise<LocationSuggestion[]> => {
  if (query.trim().length < 3) return [];
  const response = await fetch(`${API_BASE_URL}/location-suggestions?q=${encodeURIComponent(query)}`);
  if (!response.ok) return [];
  const data = await response.json();
  return data.suggestions ?? [];
};

export const reverseGeocodeLocation = async (lat: number, lon: number): Promise<string> => {
  const response = await fetch(`${API_BASE_URL}/reverse-geocode?lat=${lat}&lon=${lon}`);
  if (!response.ok) throw new ApiError("Could not determine your location name.");
  const data = await response.json();
  return data.label;
};

export const fetchCityNews = async (): Promise<string[]> => {
  const response = await fetch(`${API_BASE_URL}/city-news`);
  if (!response.ok) return [];
  const data = await response.json();
  return data.headlines ?? [];
};