//frontend/src/context/RouteContext.tsx

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { fetchRoute, fetchAlternateRoute, ApiError } from "../services/api";
import type { RouteRiskResponse, AlternateRouteResponse, SavedCommute, SafetySnapshot, RiskCategory } from "../types/route";

interface RouteContextValue {
  origin: string;
  destination: string;
  routeData: RouteRiskResponse | null;
  alternateData: AlternateRouteResponse | null;
  loading: boolean;
  alternateLoading: boolean;
  error: string | null;
  routesAnalyzed: number;
  hazardsFlagged: number;
  reroutesAccepted: number;
  savedCommutes: SavedCommute[];
  planRoute: (origin: string, destination: string) => Promise<void>;
  acceptAlternateRoute: () => boolean;
  saveCurrentCommute: (name: string, options: { favorite: boolean; recurring: boolean }) => string | null;
  refreshSavedCommute: (commuteId: string) => Promise<boolean>;
  openSavedCommute: (commuteId: string) => boolean;
  renameSavedCommute: (commuteId: string, name: string) => void;
  deleteSavedCommute: (commuteId: string) => void;
}

const SESSION_STATS_KEY = "saferoute-session-stats";
const ROUTE_STATE_KEY = "saferoute-route-state";
const SAVED_COMMUTES_KEY = "saferoute-saved-commutes";
const MAX_SNAPSHOTS = 24;

type SessionStats = {
  routesAnalyzed: number;
  hazardsFlagged: number;
  reroutesAccepted: number;
};

type PersistedRouteState = {
  origin: string;
  destination: string;
  routeData: RouteRiskResponse | null;
  alternateData: AlternateRouteResponse | null;
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

function getPersistedRouteState(): PersistedRouteState | null {
  try {
    const saved = localStorage.getItem(ROUTE_STATE_KEY);
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    return {
      origin: parsed?.origin ?? "",
      destination: parsed?.destination ?? "",
      routeData: parsed?.routeData ?? null,
      // Older persisted payloads (pre-fix) won't have this key — default it so
      // rehydration doesn't throw for users with stale localStorage.
      alternateData: parsed?.alternateData ?? null,
    };
  } catch {
    return null;
  }
}

function getPersistedCommutes(): SavedCommute[] {
  try {
    const raw = localStorage.getItem(SAVED_COMMUTES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((item) => item?.id && item?.origin && item?.destination && Array.isArray(item?.snapshots)) : [];
  } catch { return []; }
}

const riskCategory = (score: number): RiskCategory => score >= 75 ? "severe" : score >= 50 ? "high" : score >= 30 ? "moderate" : "low";
const createId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;

function makeSnapshot(route: RouteRiskResponse): SafetySnapshot {
  const segments = route.segments;
  const highest = segments.reduce<typeof segments[number] | null>((best, segment) => !best || segment.final_score > best.final_score ? segment : best, null);
  const trafficLevels = [...new Set(segments.map((segment) => segment.traffic_level))];
  const trafficState = trafficLevels.length === 1 ? trafficLevels[0] : "mixed";
  const weatherUnavailable = segments.some((segment) => segment.weather_status === "unavailable");
  const weatherCaution = segments.some((segment) => segment.weather_modifier > 0);
  return {
    id: createId(), checkedAt: new Date().toISOString(), route, riskCategory: riskCategory(route.route_total_risk),
    activeSignals: segments.filter((segment) => segment.waterlogging_flag || Boolean(segment.news_flags?.length) || segment.vision_severity !== "none" || segment.weather_modifier > 0 || ["medium", "high", "severe"].includes(segment.traffic_level)).length,
    highestRiskSegmentId: highest?.segment_id ?? null, weatherState: weatherUnavailable ? "unavailable" : weatherCaution ? "caution" : "clear", trafficState,
    waterloggingActive: segments.some((segment) => segment.waterlogging_flag), newsCount: segments.reduce((count, segment) => count + (segment.news_flags?.length ?? 0), 0), visionDetections: segments.filter((segment) => segment.vision_severity !== "none").length,
  };
}

const RouteContext = createContext<RouteContextValue | undefined>(undefined);

export function RouteProvider({ children }: { children: ReactNode }) {
  const persisted = getPersistedRouteState();
  const [origin, setOrigin] = useState(persisted?.origin ?? "");
  const [destination, setDestination] = useState(persisted?.destination ?? "");
  const [routeData, setRouteData] = useState<RouteRiskResponse | null>(persisted?.routeData ?? null);
  const [alternateData, setAlternateData] = useState<AlternateRouteResponse | null>(persisted?.alternateData ?? null);
  const [loading, setLoading] = useState(false);
  const [alternateLoading, setAlternateLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [routesAnalyzed, setRoutesAnalyzed] = useState(() => getPersistedSessionStats().routesAnalyzed);
  const [hazardsFlagged, setHazardsFlagged] = useState(() => getPersistedSessionStats().hazardsFlagged);
  const [reroutesAccepted, setReroutesAccepted] = useState(() => getPersistedSessionStats().reroutesAccepted);
  const [savedCommutes, setSavedCommutes] = useState<SavedCommute[]>(getPersistedCommutes);

    useEffect(() => {
    localStorage.setItem(SESSION_STATS_KEY, JSON.stringify({ routesAnalyzed, hazardsFlagged, reroutesAccepted }));
  }, [routesAnalyzed, hazardsFlagged, reroutesAccepted]);

  // Single persistence layer for the whole app: whatever page mounts next
  // (Route Results, Segment Diagnostics, Hazard Advisory, Analytics) reads
  // this same snapshot back out via getPersistedRouteState() above, so a
  // refresh looks like nothing happened. Route Planner doesn't render
  // routeData/alternateData at all, so it's unaffected either way — and a
  // fresh planRoute() call simply overwrites this entry on its own.
  useEffect(() => {
    localStorage.setItem(ROUTE_STATE_KEY, JSON.stringify({ origin, destination, routeData, alternateData }));
  }, [origin, destination, routeData, alternateData]);

  useEffect(() => { localStorage.setItem(SAVED_COMMUTES_KEY, JSON.stringify(savedCommutes)); }, [savedCommutes]);

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
      const snapshot = makeSnapshot(result);
      setSavedCommutes((commutes) => commutes.map((commute) => (
        commute.origin === newOrigin && commute.destination === newDestination
          ? { ...commute, snapshots: [...commute.snapshots, snapshot].slice(-MAX_SNAPSHOTS) }
          : commute
      )));
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

    setReroutesAccepted((count) => count + 1);
    return true;
  }, [alternateData, origin, destination]);

  const saveCurrentCommute = useCallback((name: string, options: { favorite: boolean; recurring: boolean }) => {
    if (!routeData || !origin || !destination || !name.trim()) return null;
    const existing = savedCommutes.find((commute) => commute.origin === origin && commute.destination === destination);
    if (existing) {
      setSavedCommutes((commutes) => commutes.map((commute) => commute.id === existing.id ? { ...commute, name: name.trim(), ...options } : commute));
      return existing.id;
    }
    const commute: SavedCommute = { id: createId(), name: name.trim(), origin, destination, ...options, createdAt: new Date().toISOString(), snapshots: [makeSnapshot(routeData)] };
    setSavedCommutes((commutes) => [commute, ...commutes]);
    return commute.id;
  }, [routeData, origin, destination, savedCommutes]);

  const refreshSavedCommute = useCallback(async (commuteId: string) => {
    const commute = savedCommutes.find(
      (item) => item.id === commuteId
    );

    if (!commute) return false;

    setLoading(true);
    setError(null);
    setOrigin(commute.origin);
    setDestination(commute.destination);
    setAlternateData(null);

    try {
      // Run the exact same live safety pipeline used by Route Planner.
      const result = await fetchRoute(
        commute.origin,
        commute.destination
      );

      // Update the active route immediately.
      setRouteData(result);

      // Update session statistics.
      setRoutesAnalyzed((count) => count + 1);

      setHazardsFlagged((count) =>
        count +
        result.segments.filter(
          (segment) =>
            segment.final_score >= 50 ||
            Boolean(segment.waterlogging_flag) ||
            Boolean(segment.news_flags?.length)
        ).length
      );

      // Create a completely new timestamped safety snapshot.
      const snapshot = makeSnapshot(result);

      // IMPORTANT:
      // Use the functional state value so the latest Saved Commute
      // is always updated, even if another state update happened
      // while the API request was running.
      setSavedCommutes((currentCommutes) =>
        currentCommutes.map((item) =>
          item.id === commuteId
            ? {
                ...item,
                snapshots: [
                  ...item.snapshots,
                  snapshot,
                ].slice(-MAX_SNAPSHOTS),
              }
            : item
        )
      );

      // Refresh alternate route data as well.
      setAlternateLoading(true);

      fetchAlternateRoute(
        commute.origin,
        commute.destination
      )
        .then((alternate) => {
          setAlternateData(alternate);
        })
        .catch(() => {
          setAlternateData(null);
        })
        .finally(() => {
          setAlternateLoading(false);
        });

      return true;
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not refresh this saved commute."
      );

      return false;
    } finally {
      setLoading(false);
    }
  }, [savedCommutes]);

  const openSavedCommute = useCallback((commuteId: string) => {
    const commute = savedCommutes.find((item) => item.id === commuteId); const snapshot = commute?.snapshots.at(-1);
    if (!commute || !snapshot) return false;
    setOrigin(commute.origin); setDestination(commute.destination); setRouteData(snapshot.route); setAlternateData(null); setError(null); return true;
  }, [savedCommutes]);
  const renameSavedCommute = useCallback((commuteId: string, name: string) => setSavedCommutes((commutes) => commutes.map((item) => item.id === commuteId && name.trim() ? { ...item, name: name.trim() } : item)), []);
  const deleteSavedCommute = useCallback((commuteId: string) => setSavedCommutes((commutes) => commutes.filter((item) => item.id !== commuteId)), []);

  return (
    <RouteContext.Provider value={{ origin, destination, routeData, alternateData, loading, alternateLoading, error, routesAnalyzed, hazardsFlagged, reroutesAccepted, savedCommutes, planRoute, acceptAlternateRoute, saveCurrentCommute, refreshSavedCommute, openSavedCommute, renameSavedCommute, deleteSavedCommute }}>      {children}
    </RouteContext.Provider>
  );
}

export function useRouteContext() {
  const ctx = useContext(RouteContext);
  if (!ctx) throw new Error("useRouteContext must be used within a RouteProvider");
  return ctx;
}