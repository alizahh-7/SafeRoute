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
  alternateLoading: boolean;
  error: string | null;
  planRoute: (origin: string, destination: string) => Promise<void>;
  acceptAlternateRoute: () => boolean;
}

const RouteContext = createContext<RouteContextValue | undefined>(undefined);

export function RouteProvider({ children }: { children: ReactNode }) {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [routeData, setRouteData] = useState<RouteRiskResponse | null>(null);
  const [alternateData, setAlternateData] = useState<AlternateRouteResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [alternateLoading, setAlternateLoading] = useState(false);
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
    // alt-route check shouldn't block the user from seeing their main results,
    // but "Simulate My Drive" waits on alternateLoading so a hazard popup never
    // fires before we know whether a reroute option exists.
    setAlternateLoading(true);
    fetchAlternateRoute(newOrigin, newDestination)
      .then(setAlternateData)
      .catch(() => setAlternateData(null))
      .finally(() => setAlternateLoading(false));
  }, []);

  const acceptAlternateRoute = useCallback(() => {
    if (!alternateData?.alternate_segments?.length) return false;
    const total = alternateData.alternate_risk ?? Math.round(
      alternateData.alternate_segments.reduce((sum, segment) => sum + segment.final_score, 0)
      / alternateData.alternate_segments.length * 10,
    ) / 10;
    setRouteData({ route_total_risk: total, segments: alternateData.alternate_segments });
    setAlternateData(null);

    // The route the user is now driving is the former alternate — re-run the
    // alternate-route check so hazards on THIS route can also offer a reroute,
    // instead of leaving them stuck with no reroute option after accepting one.
    setAlternateLoading(true);
    fetchAlternateRoute(origin, destination)
      .then(setAlternateData)
      .catch(() => setAlternateData(null))
      .finally(() => setAlternateLoading(false));

    return true;
  }, [alternateData, origin, destination]);

  return (
    <RouteContext.Provider value={{ origin, destination, routeData, alternateData, loading, alternateLoading, error, planRoute, acceptAlternateRoute }}>
      {children}
    </RouteContext.Provider>
  );
}

export function useRouteContext() {
  const ctx = useContext(RouteContext);
  if (!ctx) throw new Error("useRouteContext must be used within a RouteProvider");
  return ctx;
}
