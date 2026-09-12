//frontend/src/context/RouteContext.tsx

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { fetchRoute, fetchAlternateRoute, ApiError } from "../services/api";
import type { RouteRiskResponse, AlternateRouteResponse } from "../types/route";

interface RouteContextValue {
  origin: string;
  destination: string;
  routeData: RouteRiskResponse | null;
  alternateData: AlternateRouteResponse | null;
  loading: boolean;
  error: string | null;
  planRoute: (origin: string, destination: string) => Promise<void>;
}

const RouteContext = createContext<RouteContextValue | undefined>(undefined);

export function RouteProvider({ children }: { children: ReactNode }) {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [routeData, setRouteData] = useState<RouteRiskResponse | null>(null);
  const [alternateData, setAlternateData] = useState<AlternateRouteResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const planRoute = useCallback(async (newOrigin: string, newDestination: string) => {
    setLoading(true);
    setError(null);
    setOrigin(newOrigin);
    setDestination(newDestination);
    setAlternateData(null);

    try {
      const result = await fetchRoute(newOrigin, newDestination);
      setRouteData(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not fetch route. Is the backend running?");
      setRouteData(null);
      setLoading(false);
      return;
    }
    setLoading(false);

    // Alternate route fetch runs separately, in the background — a slow/failed
    // alt-route check shouldn't block the user from seeing their main results.
    fetchAlternateRoute(newOrigin, newDestination)
      .then(setAlternateData)
      .catch(() => setAlternateData(null));
  }, []);

  return (
    <RouteContext.Provider value={{ origin, destination, routeData, alternateData, loading, error, planRoute }}>
      {children}
    </RouteContext.Provider>
  );
}

export function useRouteContext() {
  const ctx = useContext(RouteContext);
  if (!ctx) throw new Error("useRouteContext must be used within a RouteProvider");
  return ctx;
}