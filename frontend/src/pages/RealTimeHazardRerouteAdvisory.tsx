import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Check, ChevronLeft, CloudRain, MapPin, Navigation, Radio, ShieldCheck, Volume2, CheckCircle2, VolumeX } from "lucide-react";
import { Link } from "react-router-dom";
import { useRouteContext } from "../context/RouteContext";
import HazardMap from "../components/HazardMap";
import { buildRouteGeometry } from "../components/RouteMap";
import type { RouteSegment } from "../types/route";
import type { LatLngTuple } from "leaflet";

const shell = "w-full max-w-[1440px] mx-auto px-layout-margin-mobile md:px-layout-margin-tablet lg:px-layout-margin-desktop";

// Real distance in meters between two lat/lng points — used for the live countdown.
function distanceMeters(a: LatLngTuple, b: LatLngTuple): number {
  const R = 6371000;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLng = ((b[1] - a[1]) * Math.PI) / 180;
  const lat1 = (a[0] * Math.PI) / 180;
  const lat2 = (b[0] * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function speak(text: string) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.02;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
}

type Phase = "approaching" | "arrived" | "rerouted";

export default function RealTimeHazardRerouteAdvisory() {
  const { routeData, alternateData, acceptAlternateRoute } = useRouteContext();
  const segments = routeData?.segments ?? [];
  const [voiceOn, setVoiceOn] = useState(false);
  const [phase, setPhase] = useState<Phase>("approaching");
  const [pointIndex, setPointIndex] = useState(0);
  const hasSpokenArrival = useRef(false);

  useEffect(() => { document.title = "REAL-TIME HAZARD & REROUTE ADVISORY | SafeRoute Telangana"; }, []);

  const direct = useMemo(
    () => segments.reduce<RouteSegment | null>((worst, item) => !worst || item.final_score > worst.final_score ? item : worst, null),
    [segments],
  );

  const hasAlternate = Boolean(alternateData?.alternate_available && alternateData.should_suggest_alternate && alternateData.alternate_segments?.length);

  function interpolate(points: LatLngTuple[], stepsBetween = 12): LatLngTuple[] {
    if (points.length < 2) return points;

    const out: LatLngTuple[] = [];

    for (let i = 0; i < points.length - 1; i++) {
      const [lat1, lng1] = points[i];
      const [lat2, lng2] = points[i + 1];

      for (let s = 0; s < stepsBetween; s++) {
        const t = s / stepsBetween;
        out.push([
          lat1 + (lat2 - lat1) * t,
          lng1 + (lng2 - lng1) * t,
        ]);
      }
    }

    out.push(points[points.length - 1]);

    return out;
  }

  const approachPath = useMemo(
    () => interpolate(direct ? (direct.coordinates as LatLngTuple[]) : []),
    [direct],
  );

  const alternatePath = useMemo(
    () =>
      hasAlternate
        ? interpolate(buildRouteGeometry(alternateData!.alternate_segments!))
        : [],
    [hasAlternate, alternateData],
  );

  const activePath = phase === "rerouted" ? alternatePath : approachPath;
  const vehiclePosition: LatLngTuple | null = activePath[pointIndex] ?? activePath[activePath.length - 1] ?? null;

  const distanceToHazard = useMemo(() => {
    if (phase !== "approaching" || !approachPath.length) return 0;
    let remaining = 0;
    for (let i = pointIndex; i < approachPath.length - 1; i++) {
      remaining += distanceMeters(approachPath[i], approachPath[i + 1]);
    }
    return Math.round(remaining);
  }, [phase, pointIndex, approachPath]);

  // Drive the animation along whichever path is currently active.
  useEffect(() => {
    if (!activePath.length || phase === "arrived") return;
    const timer = window.setInterval(() => {
      setPointIndex((current) => {
        const next = current + 1;
        if (next >= activePath.length) {
          window.clearInterval(timer);
          setPhase((p) => (p === "rerouted" ? "arrived" : p));
          return current;
        }
        return next;
      });
    }, 500);
    return () => window.clearInterval(timer);
  }, [activePath, phase]);

  // Speak once when the hazard is imminent (near the end of the approach path).
  useEffect(() => {
    if (!voiceOn || !direct || phase !== "approaching") return;
    const nearHazard = distanceToHazard > 0 && distanceToHazard < 80;
    if (nearHazard) {
      speak(`Caution. ${direct.explanation}. Risk score ${direct.final_score} out of 100 near ${direct.road_name}.`);
    }
  }, [voiceOn, distanceToHazard, direct, phase]);

  if (!direct) {
    return <div className="pt-20 min-h-screen bg-background"><div className={shell + " pt-space-2xl"}>Evaluate a route before opening the live advisory.</div></div>;
  }

  const acceptRoute = () => {
    if (!acceptAlternateRoute()) return;
    setPhase("rerouted");
    setPointIndex(0);
    hasSpokenArrival.current = false;
    if (voiceOn) speak("Safer route accepted. Rerouting now.");
  };

  useEffect(() => {
    if (phase === "arrived" && voiceOn && !hasSpokenArrival.current) {
      hasSpokenArrival.current = true;
      speak("You are now on the safer route.");
    }
  }, [phase, voiceOn]);

  const riskTone = direct.final_score >= 75 ? "text-[#B93535]" : "text-[#D36128]";
  const progressPct = activePath.length > 1 ? Math.round((pointIndex / (activePath.length - 1)) * 100) : 0;

  return <div className="pt-20 min-h-screen bg-surface-container"><div className={shell + " py-space-xl"}>
    <div className="flex justify-between font-body-sm text-on-surface-variant"><Link to="/route" className="inline-flex gap-space-xs items-center"><ChevronLeft size={16}/>Back to route results</Link><span>Route-signal advisory</span></div>
    <section className="mt-space-md overflow-hidden rounded-[2rem] bg-surface-container-lowest border border-surface-variant shadow-xl">
      <div className={"px-space-lg py-space-xs text-white font-label-caps-micro uppercase flex justify-between " + (phase !== "approaching" ? "bg-[#2E7D5B]" : "bg-[#C92325]")}>
        <span><Radio size={13} className="inline mr-1"/>{phase === "approaching" ? "Live hazard intercept" : phase === "rerouted" ? "Rerouting in progress" : "Reroute complete"}</span>
        <span>{phase === "approaching" ? `Approaching · ${progressPct}%` : phase === "rerouted" ? `En route · ${progressPct}%` : "Arrived"}</span>
      </div>
      <div className="p-space-lg md:p-space-xl">
        <div className="flex flex-col md:flex-row justify-between gap-space-lg">
          <div>
            <span className={"font-label-caps-micro uppercase " + (phase === "approaching" ? "text-[#B93535]" : "text-[#2E7D5B]")}>
              {phase === "approaching" ? "Highest-risk loaded segment" : phase === "rerouted" ? "Vehicle transitioning" : "Reroute confirmed"}
            </span>
            <h1 className="font-headline-lg mt-space-xs">REAL-TIME HAZARD & REROUTE ADVISORY</h1>
            <p className="font-body-md text-on-surface-variant mt-space-xs">
              {phase === "approaching"
                ? `Simulated vehicle is approaching ${direct.road_name}. Watch the live map below.`
                : phase === "rerouted"
                  ? "Your vehicle is now moving along the safer alternate route."
                  : "You've arrived on the safer route. This page and Route Results are now in sync."}
            </p>
            <p className="font-body-sm mt-space-sm"><MapPin size={15} className="inline text-[#B93535]"/> {direct.midpoint.lat.toFixed(4)}, {direct.midpoint.lng.toFixed(4)} <span className="text-on-surface-variant">· Source: route geometry</span></p>
          </div>
          {phase === "approaching" && (
            <div className={"rounded-xl bg-[#F9EAEA] p-space-lg min-w-40 " + riskTone}>
              <span className="font-label-caps-micro">RISK SCORE</span>
              <b className="block text-5xl">{direct.final_score}</b>
              <span className="font-body-sm">/100</span>
              <span className="block mt-space-xs font-label-caps-micro text-on-surface-variant">Source: fused route analysis</span>
              <div className="mt-space-sm font-body-sm text-on-surface">{distanceToHazard} m ahead</div>
            </div>
          )}
        </div>

        {phase === "approaching" && (
          <div className="mt-space-md h-2 rounded-full bg-surface-container-low overflow-hidden">
            <div className="h-full bg-[#B93535] transition-all duration-500" style={{ width: `${progressPct}%` }} />
          </div>
        )}

        <section className="mt-space-lg h-[420px] overflow-hidden rounded-[1.75rem] border border-surface-variant">
          <HazardMap
            routeSegments={segments}
            hazardSegment={direct}
            alternateSegments={hasAlternate ? alternateData?.alternate_segments : null}
            rerouted={phase !== "approaching"}
            vehiclePosition={vehiclePosition}
          />
        </section>
        <p className="font-body-sm text-on-surface-variant text-center mt-space-xs">
          {phase === "rerouted" || phase === "arrived"
            ? "Green is your active route. The dark marker is your simulated position."
            : hasAlternate
              ? "Gold is the active route; dashed green is the backend-scored safer alternate. The dark marker shows simulated approach."
              : "Gold is the active route. The red ring marks the current hazard."}
        </p>

        {phase === "approaching" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg mt-space-xl">
            <article className="rounded-[1.75rem] bg-[#F9EAEA] p-space-lg border-t-4 border-[#B93535]">
              <span className="font-label-caps-micro text-[#B93535] uppercase">Current route hazard</span>
              <h2 className="font-headline-md mt-space-xs">{direct.road_name}</h2>
              <p className="font-body-sm text-on-surface-variant mt-space-sm">{direct.explanation}</p>
              <div className="grid grid-cols-2 gap-space-sm mt-space-md font-body-sm">
                <span><CloudRain size={14} className="inline"/> {direct.waterlogging_flag ? "Waterlogging" : "Drainage clear"}<small className="block text-on-surface-variant mt-space-2xs">Source: Open-Meteo / drainage signal</small></span>
                <span><Navigation size={14} className="inline"/> {direct.traffic_level} traffic<small className="block text-on-surface-variant mt-space-2xs">Source: TomTom live traffic</small></span>
              </div>
              <p className="font-label-caps-micro uppercase text-on-surface-variant mt-space-md">Risk source: IIT Delhi crash data · YOLOv8 · weather · news/dispatch</p>
            </article>
            <article className="rounded-[1.75rem] bg-surface-container-low p-space-lg border-t-4 border-secondary">
              <span className="font-label-caps-micro text-secondary uppercase"><ShieldCheck size={14} className="inline"/> Safer route recommendation</span>
              <h2 className="font-headline-md mt-space-xs">{hasAlternate ? "Backend-scored alternate route" : "Alternate route unavailable"}</h2>
              <p className="font-body-sm text-on-surface-variant mt-space-sm">{hasAlternate ? "Alternate risk: " + alternateData?.alternate_risk + "/100, with " + alternateData?.extra_time_minutes + " additional minute(s)." : "The backend has not found an alternate that meets the safety and time threshold for this route."}</p>
              {hasAlternate && <p className="font-label-caps-micro uppercase text-on-surface-variant mt-space-xs">Source: backend alternate-route risk scoring</p>}
              <div className="grid grid-cols-2 gap-space-xs mt-space-md font-body-sm">
                <span><Check size={14} className="inline text-[#2E7D5B]"/> Lower exposure</span>
                <span><Check size={14} className="inline text-[#2E7D5B]"/> Real route geometry</span>
              </div>
              <button disabled={!hasAlternate} type="button" onClick={acceptRoute} className="btn btn-primary mt-space-lg w-full disabled:opacity-50">Accept safer reroute <ArrowRight size={16}/></button>
            </article>
          </div>
        )}

        {phase === "arrived" && (
          <div className="mt-space-xl rounded-[1.75rem] bg-[#EAF5EF] border-t-4 border-[#2E7D5B] p-space-lg flex items-center gap-space-md">
            <CheckCircle2 className="text-[#2E7D5B] shrink-0" size={28} />
            <div>
              <h2 className="font-headline-md">You're on the safer route now</h2>
              <p className="font-body-sm text-on-surface-variant mt-space-2xs">This page and Route Results now reflect the same active route.</p>
            </div>
            <Link to="/route" className="btn btn-outline ml-auto shrink-0">View in Route Results</Link>
          </div>
        )}

        <button type="button" onClick={() => setVoiceOn(!voiceOn)} className="mt-space-lg font-body-sm inline-flex gap-space-xs items-center">
          {voiceOn ? <Volume2 size={16}/> : <VolumeX size={16}/>} Voice advisory {voiceOn ? "enabled" : "disabled"}
        </button>
      </div>
    </section>
  </div></div>;
}
