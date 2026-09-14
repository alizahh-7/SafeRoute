//frontend/src/context/RouteContext.tsx

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { fetchRoute, fetchAlternateRoute, ApiError } from "../services/api";
import type { RouteRiskResponse, AlternateRouteResponse } from "../types/route";

interface RouteContextValue {
  origin: string;
  destination: string;
  routeData: RouteRiskResponse | null;
  alternateData: AlternateRouteResponse | null;
  loading: boolean;
  error: string | null;
  routesAnalyzed: number;
  hazardsFlagged: number;
  reroutesAccepted: number;
  planRoute: (origin: string, destination: string) => Promise<void>;
  acceptAlternateRoute: () => boolean;
}

const SESSION_STATS_KEY = "saferoute-session-stats";

type SessionStats = {
  routesAnalyzed: number;
  hazardsFlagged: number;
  reroutesAccepted: number;
};

function getPersistedSessionStats(): SessionStats {
  try {
    const saved = localStorage.getItem(SESSION_STATS_KEY);
    if (!saved) return { routesAnalyzed: 0, hazardsFlagged: 0, reroutesAccepted: 0 };
    const parsed = JSON.parse(saved);
    return {
      routesAnalyzed: Number.isFinite(parsed.routesAnalyzed) ? parsed.routesAnalyzed : 0,
      hazardsFlagged: Number.isFinite(parsed.hazardsFlagged) ? parsed.hazardsFlagged : 0,
      reroutesAccepted: Number.isFinite(parsed.reroutesAccepted) ? parsed.reroutesAccepted : 0,
    };
  } catch {
    return { routesAnalyzed: 0, hazardsFlagged: 0, reroutesAccepted: 0 };
  }
}

const RouteContext = createContext<RouteContextValue | undefined>(undefined);

export function RouteProvider({ children }: { children: ReactNode }) {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [routeData, setRouteData] = useState<RouteRiskResponse | null>(null);
  const [alternateData, setAlternateData] = useState<AlternateRouteResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [routesAnalyzed, setRoutesAnalyzed] = useState(() => getPersistedSessionStats().routesAnalyzed);
  const [hazardsFlagged, setHazardsFlagged] = useState(() => getPersistedSessionStats().hazardsFlagged);
  const [reroutesAccepted, setReroutesAccepted] = useState(() => getPersistedSessionStats().reroutesAccepted);

  useEffect(() => {
    localStorage.setItem(SESSION_STATS_KEY, JSON.stringify({ routesAnalyzed, hazardsFlagged, reroutesAccepted }));
  }, [routesAnalyzed, hazardsFlagged, reroutesAccepted]);

  const planRoute = useCallback(async (newOrigin: string, newDestination: string) => {
    setLoading(true);
    setError(null);
    setOrigin(newOrigin);
    setDestination(newDestination);
    setAlternateData(null);

    try {
      const result = await fetchRoute(newOrigin, newDestination);
      setRouteData(result);
      setRoutesAnalyzed((count) => count + 1);
      setHazardsFlagged((count) => count + result.segments.filter((segment) => (
        segment.final_score >= 50 || Boolean(segment.waterlogging_flag) || Boolean(segment.news_flags?.length)
      )).length);
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

  const acceptAlternateRoute = useCallback(() => {
    if (!alternateData?.alternate_segments?.length) return false;
    const total = alternateData.alternate_risk ?? Math.round(
      alternateData.alternate_segments.reduce((sum, segment) => sum + segment.final_score, 0)
      / alternateData.alternate_segments.length * 10,
    ) / 10;
    setRouteData({ route_total_risk: total, segments: alternateData.alternate_segments });
    setAlternateData(null);
    setReroutesAccepted((count) => count + 1);
    return true;
  }, [alternateData]);

  return (
    <RouteContext.Provider value={{ origin, destination, routeData, alternateData, loading, error, routesAnalyzed, hazardsFlagged, reroutesAccepted, planRoute, acceptAlternateRoute }}>
      {children}
    </RouteContext.Provider>
  );
}

export function useRouteContext() {
  const ctx = useContext(RouteContext);
  if (!ctx) throw new Error("useRouteContext must be used within a RouteProvider");
  return ctx;
}
