//frontend/src/pages/RouteResults.tsx

import { useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import { Navigation, ShieldCheck, AlertTriangle, Zap, Eye, CheckCircle, Pause, Play, Square, CloudRain, Bookmark, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useRouteContext } from "../context/RouteContext";
import RouteMap from "../components/RouteMap";
import SegmentDetailDrawer from "../components/SegmentDetailDrawer";
import SegmentRiskBadge from "../components/SegmentRiskBadge";
import type { RouteSegment } from "../types/route";
import { buildRouteGeometry } from "../components/RouteMap";
import type { LatLngTuple } from "leaflet";
import { downloadSafetyReport as exportSafetyReport } from "../services/safetyReport";

const riskColor = (score: number) => score >= 75 ? "#B93535" : score >= 50 ? "#D36128" : score >= 30 ? "#D99B26" : "#2E7D5B";

const LOOKAHEAD_METERS = 250;

function speak(text: string) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.4;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
}

function distanceMeters(a: LatLngTuple, b: LatLngTuple): number {
  const R = 6371000;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLng = ((b[1] - a[1]) * Math.PI) / 180;
  const lat1 = (a[0] * Math.PI) / 180;
  const lat2 = (b[0] * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function hazardReasons(segment: RouteSegment): string[] {
  const reasons: string[] = [];
  if (segment.waterlogging_flag) reasons.push("waterlogging");
  if (segment.traffic_level === "high" || segment.traffic_level === "severe") reasons.push(`${segment.traffic_level} traffic`);
  if (segment.vision_severity === "moderate" || segment.vision_severity === "severe") reasons.push(`${segment.vision_severity} road damage`);
  if (segment.weather_modifier >= 10) reasons.push("adverse weather");
  if (segment.news_flags?.length) reasons.push(segment.news_flags[0]);
  return reasons;
}

function isHazardWorthy(segment: RouteSegment): boolean {
  return segment.final_score >= 30 || hazardReasons(segment).length > 0;
}

const RouteResults = () => {
  const { routeData, alternateData, origin, destination, loading, alternateLoading, error, acceptAlternateRoute, savedCommutes, saveCurrentCommute } = useRouteContext();
  const [activeSegment, setActiveSegment] = useState<RouteSegment | null>(null);
  const [driveIndex, setDriveIndex] = useState(0);
  const [driving, setDriving] = useState(false);
  const [driveAlert, setDriveAlert] = useState<RouteSegment | null>(null);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [voiceOn, setVoiceOn] = useState(false);
  const [rerouteProgress, setRerouteProgress] = useState<number | null>(null);
  const [saveOpen, setSaveOpen] = useState(false);
  const [commuteName, setCommuteName] = useState("");
  const [favoriteCommute, setFavoriteCommute] = useState(false);
  const [recurringCommute, setRecurringCommute] = useState(false);

  const segments = routeData?.segments ?? [];

  const routePoints = useMemo(() => buildRouteGeometry(segments), [segments]);

  const segmentBoundaries = useMemo(() => {
    let acc = 0;
    return segments.map((segment) => {
      const start = acc;
      acc += segment.coordinates.length;
      return { segment, start, end: acc };
    });
  }, [segments]);

  const drivePosition: LatLngTuple | null = routePoints[driveIndex] ?? null;

  useEffect(() => {
    if (rerouteProgress === null) return;
    const newIndex = routePoints.length > 1 ? Math.round(rerouteProgress * (routePoints.length - 1)) : 0;
    setDriveIndex(newIndex);
    setDriving(true);
    setRerouteProgress(null);
  }, [routePoints, rerouteProgress]);

  useEffect(() => {
    if (!driving || !routePoints.length) return;
    const timer = window.setInterval(() => {
      setDriveIndex((current) => {
        const next = current + 1;
        if (next >= routePoints.length) { setDriving(false); return current; }

        const vehiclePoint = routePoints[next];
        const currentBoundary = segmentBoundaries.find((b) => next >= b.start && next < b.end);
        const currentSegmentIndex = currentBoundary ? segmentBoundaries.indexOf(currentBoundary) : 0;

        let approaching: RouteSegment | null = null;
        for (let i = currentSegmentIndex; i < segmentBoundaries.length; i++) {
          const { segment } = segmentBoundaries[i];
          if (dismissedIds.has(segment.segment_id)) continue;
          if (!isHazardWorthy(segment)) continue;

          const segmentStart = segment.coordinates[0] as LatLngTuple;
          const distanceAhead = distanceMeters(vehiclePoint, segmentStart);

          if (distanceAhead <= LOOKAHEAD_METERS) {
            approaching = segment;
          }
          break; // nearest upcoming hazard only â€” further ones are farther away by definition
        }

        if (approaching) {
          setDriveAlert(approaching);
          setDriving(false);
          if (voiceOn) {
            const voiceReasons = [
              approaching.waterlogging_flag ? "waterlogging" : null,
              approaching.traffic_level === "high" || approaching.traffic_level === "severe" ? `${approaching.traffic_level} traffic` : null,
              approaching.vision_severity === "moderate" || approaching.vision_severity === "severe" ? "road damage" : null,
              approaching.weather_modifier >= 10 ? "bad weather" : null,
              approaching.news_flags?.length ? "a local news alert" : null,
            ].filter(Boolean).join(", ") || "elevated risk";
            const altPart = alternateData?.alternate_available
              ? (showAlternate ? "A safer alternate route is available. Continue, or reroute?" : "No safer alternate found. Recommend continuing.")
              : "Checking for an alternate route.";
            speak(`Hazard ahead near ${approaching.road_name}: ${voiceReasons}. ${altPart}`);
          }
        }
        return next;
      });
    }, 700);
    return () => window.clearInterval(timer);
  }, [driving, routePoints, segmentBoundaries, dismissedIds, voiceOn]);

  if (loading) return <div className="pt-32 text-center font-body-lg">Analyzing your route with real data...</div>;
  if (error) return <div className="pt-32 text-center font-body-lg text-error">{error}</div>;
  if (!routeData) return (
    <div className="pt-32 text-center font-body-lg flex flex-col items-center gap-space-md">
      <p>No route yet â€” go plan one first.</p>
      <Link to="/route-planner" className="btn btn-primary">Go to Route Planner</Link>
    </div>
  );

  const { route_total_risk } = routeData;
  const primaryColor = riskColor(route_total_risk);
  const hazardCount = segments.filter(s => s.waterlogging_flag || s.news_flags?.length || s.vision_severity !== "none").length;
  const worstSegment = segments.reduce((worst, s) => !worst || s.final_score > worst.final_score ? s : worst, segments[0]);
  const showAlternate = alternateData?.alternate_available && alternateData.should_suggest_alternate;
  const savedCommute = savedCommutes.find((commute) => commute.origin === origin && commute.destination === destination);

  const stopDrive = () => { setDriving(false); setDriveIndex(0); setDriveAlert(null); setDismissedIds(new Set()); window.speechSynthesis.cancel(); };
  const continueDrive = () => {
    window.speechSynthesis.cancel();
    if (driveAlert) setDismissedIds((prev) => new Set(prev).add(driveAlert.segment_id));
    setDriveAlert(null);
    setDriving(true);
  };
  const acceptReroute = () => {
    window.speechSynthesis.cancel();
    const progressFraction = routePoints.length > 1 ? driveIndex / (routePoints.length - 1) : 0;
    if (!acceptAlternateRoute()) return;
    setDriveAlert(null);
    setDismissedIds(new Set());
    setRerouteProgress(progressFraction);
  };
  
  const downloadSafetyReport = () => {
    exportSafetyReport(origin, destination, routeData);
    return;
    const report = new jsPDF({ orientation: "landscape", unit: "mm", format: "a3" });
    const pageWidth = report.internal.pageSize.getWidth();
    const pageHeight = report.internal.pageSize.getHeight();
    const margin = 12;
    const truncate = (value: string, maxLength: number) => value.length > maxLength ? `${value.slice(0, maxLength - 1)}â€¦` : value;
    const flagStatus = (segment: RouteSegment) => [
      segment.waterlogging_flag ? "Waterlogging" : "",
      ...(segment.news_flags ?? []).length ? "News" : "",
    ].filter(Boolean).join(", ") || "None";

    report.setTextColor(26, 26, 24);
    report.setFont("helvetica", "bold");
    report.setFontSize(20);
    report.text("SafeRoute Telangana â€” Safety Report", margin, 18);
    report.setFont("helvetica", "normal");
    report.setFontSize(9);
    report.text(`Route: ${origin} â†’ ${destination}`, margin, 26);
    report.text(`Overall risk: ${route_total_risk}/100     Generated: ${new Date().toLocaleString()}`, margin, 32);

    report.setFillColor(248, 244, 232);
    report.roundedRect(margin, 38, pageWidth - margin * 2, 22, 2, 2, "F");
    report.setFont("helvetica", "bold");
    report.setFontSize(9);
    report.text(`Highest-risk segment: ${worstSegment.road_name} (${worstSegment.final_score}/100)`, margin + 5, 45);
    report.setFont("helvetica", "normal");
    report.setFontSize(7.5);
    
    const explanation = report.splitTextToSize(worstSegment.explanation, pageWidth - margin * 2 - 10);
    report.text(explanation.slice(0, 2), margin + 5, 51);

    const tableTop = 68;
    const footerTop = pageHeight - 11;
    const rowHeight = Math.max(3.2, Math.min(6, (footerTop - tableTop - 8) / Math.max(segments.length, 1)));
    const columns = [
      { title: "Road name", x: margin, width: 124 },
      { title: "Risk", x: margin + 124, width: 26 },
      { title: "Vision severity", x: margin + 150, width: 48 },
      { title: "Traffic level", x: margin + 198, width: 42 },
      { title: "Active flag", x: margin + 240, width: pageWidth - margin - (margin + 240) },
    ];
    report.setFillColor(212, 162, 52);
    report.rect(margin, tableTop, pageWidth - margin * 2, 7, "F");
    report.setTextColor(26, 26, 24);
    report.setFont("helvetica", "bold");
    report.setFontSize(7.5);
    columns.forEach(({ title, x }) => report.text(title, x + 2, tableTop + 4.6));

    report.setFont("helvetica", "normal");
    report.setFontSize(Math.max(5.5, Math.min(7.5, rowHeight + 1.2)));
    segments.forEach((segment, index) => {
      const y = tableTop + 7 + rowHeight * index;
      if (index % 2 === 0) {
        report.setFillColor(250, 248, 245);
        report.rect(margin, y, pageWidth - margin * 2, rowHeight, "F");
      }
      const baseline = y + rowHeight * 0.68;
      report.setTextColor(26, 26, 24);
      report.text(truncate(segment.road_name, 58), columns[0].x + 2, baseline);
      report.text(`${segment.final_score}/100`, columns[1].x + 2, baseline);
      report.text(segment.vision_severity, columns[2].x + 2, baseline);
      report.text(segment.traffic_level, columns[3].x + 2, baseline);
      report.text(truncate(flagStatus(segment), 42), columns[4].x + 2, baseline);
    });

    report.setTextColor(90, 90, 84);
    report.setFontSize(7);
    report.text("Data sources: IIT Delhi Telangana crash dataset, Open-Meteo, TomTom, YOLOv8 road-surface detection, Google News RSS", margin, pageHeight - 6);
    report.save("SafeRoute-Telangana-Safety-Report.pdf");
  };
  const saveCommute = () => {
    const id = saveCurrentCommute(commuteName || `${origin} â†’ ${destination}`, { favorite: favoriteCommute, recurring: recurringCommute });
    if (id) setSaveOpen(false);
  };

  return (
    <div className="w-full pt-20 bg-background min-h-screen pb-space-3xl">
      <div className="max-w-[1440px] mx-auto px-layout-margin-mobile md:px-layout-margin-tablet lg:px-layout-margin-desktop pt-space-xl">

        <div className="flex justify-between items-end flex-wrap gap-space-md mb-space-xl">
          <div className="flex flex-col gap-space-xs">
            <span className="font-label-caps-micro text-label-caps-micro uppercase text-secondary font-bold tracking-widest bg-secondary-container/20 px-space-sm py-space-2xs rounded-full self-start">Real-Data Route Analysis</span>
            <h1 className="font-display-hero text-display-hero text-on-surface tracking-tight font-medium max-w-2xl leading-tight">{origin} â†’ {destination}</h1>
          </div>
          <div className="text-right">
            <div className="font-display-hero text-display-hero font-semibold leading-none" style={{ color: primaryColor }}>{route_total_risk}</div>
            <div className="font-label-caps-micro text-label-caps-micro font-bold text-on-surface-variant uppercase mt-space-2xs">Overall risk / 100</div>
            <div className="font-label-caps-micro text-label-caps-micro text-on-surface-variant mt-space-2xs">Source: fused route analysis</div>
          </div>
        </div>

        <div className="rounded-xl border-2 p-space-lg mb-space-xl bg-surface-container-lowest flex flex-col sm:flex-row justify-between gap-space-md items-start sm:items-center" style={{ borderColor: primaryColor }}>
          <div>
            <p className="font-body-md"><b>Riskiest point on this route:</b> {worstSegment.road_name} ({worstSegment.final_score}/100)</p>
            <p className="font-body-sm text-on-surface-variant mt-space-2xs">{worstSegment.explanation}</p>
            <p className="font-label-caps-micro text-label-caps-micro uppercase text-on-surface-variant mt-space-xs">Source: segment-level multi-factor risk fusion</p>
          </div>
          <div className="flex flex-wrap gap-space-xs shrink-0">
            <button type="button" onClick={() => { setCommuteName(savedCommute?.name ?? `${origin} â†’ ${destination}`); setFavoriteCommute(savedCommute?.favorite ?? false); setRecurringCommute(savedCommute?.recurring ?? false); setSaveOpen(true); }} className="btn btn-outline"><Bookmark size={16} fill={savedCommute ? "currentColor" : "none"}/>{savedCommute ? "Saved" : "Save Commute"}</button>
            <button type="button" onClick={downloadSafetyReport} className="btn btn-primary">Download Safety Report</button>
            <button type="button" onClick={() => setActiveSegment(worstSegment)} className="btn btn-outline">Inspect this segment</button>
          </div>
        </div>

        {saveOpen && <section className="mb-space-xl rounded-xl border border-secondary-container bg-surface-container-low p-space-lg"><div className="flex flex-wrap justify-between gap-space-sm"><div><span className="font-label-caps-micro uppercase text-secondary">Save recurring route</span><h2 className="font-headline-sm mt-space-xs">Build a safety profile for this commute</h2><p className="font-body-sm text-on-surface-variant mt-space-xs">Future â€œCheck Nowâ€ actions will rerun the existing route pipeline and append timestamped safety snapshots on this device.</p></div><button type="button" onClick={() => setSaveOpen(false)} className="font-body-sm">Close</button></div><div className="mt-space-md flex flex-col lg:flex-row gap-space-sm lg:items-end"><label className="flex-1 font-body-sm">Commute name<input value={commuteName} onChange={(event) => setCommuteName(event.target.value)} className="mt-space-xs block w-full rounded-lg border border-surface-variant bg-surface-container-lowest px-space-md py-space-sm" placeholder="Home â†’ College"/></label><label className="inline-flex items-center gap-space-xs font-body-sm"><input type="checkbox" checked={favoriteCommute} onChange={(event) => setFavoriteCommute(event.target.checked)}/><Star size={15} className="text-secondary"/>Favourite</label><label className="inline-flex items-center gap-space-xs font-body-sm"><input type="checkbox" checked={recurringCommute} onChange={(event) => setRecurringCommute(event.target.checked)}/>Recurring commute</label><button type="button" onClick={saveCommute} className="btn btn-primary">{savedCommute ? "Update saved commute" : "Save Commute"}</button></div></section>}

        {alternateData?.alternate_available && (
          <div className="rounded-xl p-space-lg mb-space-xl bg-surface-container-low flex items-center gap-space-sm">
            {showAlternate ? (
              <>
                <ShieldCheck className="text-[#2E7D5B] shrink-0" size={22} />
                <p className="font-body-sm">
                  A genuinely safer alternate exists: <b>{alternateData.alternate_risk}/100</b> risk vs. <b>{alternateData.primary_risk}/100</b> on this route, for {alternateData.extra_time_minutes} extra minute(s).
                </p>
              </>
            ) : (
              <>
                <AlertTriangle className="text-on-surface-variant shrink-0" size={20} />
                <p className="font-body-sm text-on-surface-variant">No meaningfully safer alternate was found for this trip â€” this route is already close to the best available option.</p>
              </>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
          <div className="lg:col-span-7 flex flex-col gap-space-md">
            <div className="rounded-xl overflow-hidden border border-surface-variant shadow-sm h-[420px]">
              <RouteMap segments={segments} alternateSegments={showAlternate ? alternateData?.alternate_segments : null} drivePosition={drivePosition} onSegmentSelect={setActiveSegment} />
            </div>
            <p className="font-body-sm text-on-surface-variant text-center">Route geometry is drawn from the OpenRouteService coordinates returned for this analysis.</p>
            <div className="flex flex-wrap items-center gap-space-sm rounded-xl bg-surface-container-low p-space-md">
              <span className="font-body-sm font-semibold mr-auto">Simulate My Drive</span>
              <button type="button" onClick={() => setVoiceOn(!voiceOn)} className="btn btn-outline">{voiceOn ? "Voice on" : "Voice off"}</button>
              <button type="button" onClick={() => setDriving(!driving)} disabled={!routePoints.length || alternateLoading} className="btn btn-primary">{driving ? <Pause size={16}/> : <Play size={16}/>} {alternateLoading ? "Checking routes..." : driving ? "Pause" : driveIndex ? "Resume" : "Start"}</button>
              <button type="button" onClick={stopDrive} className="btn btn-outline"><Square size={15}/> Stop</button>
            </div>
            {driveAlert && <div className="rounded-xl border border-[#D36128]/30 bg-[#FAEEE8] p-space-md"><div className="flex flex-wrap items-center justify-between gap-space-sm"><div><b>Upcoming hazard near {driveAlert.road_name} (~{LOOKAHEAD_METERS}m ahead): {hazardReasons(driveAlert).join(", ") || "elevated risk"}</b><p className="font-body-sm mt-space-2xs">Risk {driveAlert.final_score}/100.</p><p className="font-body-sm mt-space-2xs">{alternateData?.alternate_available ? (showAlternate ? `Safer alternate available: ${alternateData.alternate_risk}/100 risk vs. ${alternateData.primary_risk}/100 here, for ${alternateData.extra_time_minutes} extra minute(s).` : alternateData.recommendation) : "Checking for an alternate route..."}</p></div><div className="flex gap-space-xs"><button type="button" className="btn btn-outline" onClick={continueDrive}>Continue</button>{showAlternate && <button type="button" className="btn btn-primary" onClick={acceptReroute}>Accept safer route</button>}</div></div></div>}

            <div className="bg-surface-container-lowest p-space-md rounded-xl flex items-center gap-space-md border border-surface-variant shadow-sm">
              <div className="w-10 h-10 shrink-0 rounded-full bg-secondary-container/20 flex items-center justify-center text-secondary border border-secondary/30">
                <Zap size={20} />
              </div>
              <div>
                <div className="font-headline-sm font-semibold">{segments.length} segments Â· {hazardCount} with an active hazard signal</div>
                <div className="font-body-sm text-on-surface-variant">Historical crash data, live weather, live traffic, waterlogging fusion, road-surface vision, and local news â€” click any segment for the full breakdown.</div>
                <div className="font-label-caps-micro text-label-caps-micro uppercase text-on-surface-variant mt-space-2xs">Sources: IIT Delhi Â· Open-Meteo Â· TomTom Â· YOLOv8 Â· Google News RSS</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-surface-variant flex flex-col">
            <div className="flex justify-between items-center mb-space-lg">
              <div className="font-headline-sm flex items-center gap-space-xs"><Navigation size={18} className="text-secondary"/> Route Segments</div>
              <div className="font-label-caps-micro font-bold text-on-surface-variant uppercase">{segments.length} total</div>
            </div>

            <div className="flex flex-col gap-space-sm overflow-y-auto max-h-[480px] pr-space-2xs">
              {segments.map((seg) => (
                <button
                  key={seg.segment_id}
                  onClick={() => setActiveSegment(seg)}
                  className="text-left rounded-xl p-space-md border border-surface-variant hover:bg-surface-container-low transition-colors flex justify-between items-start gap-space-sm"
                >
                  <div>
                    <div className="font-body-md font-semibold">{seg.road_name}</div>
                    <div className="font-body-sm text-on-surface-variant mt-space-2xs flex items-center gap-space-xs flex-wrap">
                      <Eye size={12} /> {seg.vision_severity} surface Â· {seg.traffic_status === "unavailable" ? "traffic unavailable" : `live ${seg.traffic_level} traffic`}
                      {seg.weather_status === "unavailable" ? <><CloudRain size={12} className="text-on-surface-variant" /> weather unavailable</> : seg.weather_modifier >= 10 ? <><CloudRain size={12} className="text-[#3A7CA5]" /> live weather caution</> : <span>Â· weather clear</span>}
                      {seg.waterlogging_flag ? <span className="text-[#B93535]">waterlogging</span> : null}
                      {seg.news_flags?.length ? <><AlertTriangle size={12} className="text-[#B93535]" /> news</> : null}
                    </div>
                  </div>
                  <SegmentRiskBadge score={seg.final_score} size="sm" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-space-xl p-space-lg rounded-xl bg-surface-container-low text-center">
          <CheckCircle size={20} className="inline text-[#2E7D5B] mr-space-2xs" />
          <span className="font-body-sm">Want the full picture across every segment at once? </span>
          <Link to="/analytics" className="font-body-sm text-secondary hover:underline font-semibold">Open the Analytics Heatmap â†’</Link>
        </div>
      </div>

      <SegmentDetailDrawer segment={activeSegment} onClose={() => setActiveSegment(null)} />
    </div>
  );
};

export default RouteResults;