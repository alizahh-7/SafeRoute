//frontend/src/pages/RouteResults.tsx

import { useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import { Navigation, ShieldCheck, AlertTriangle, Zap, Eye, CheckCircle, Pause, Play, Square } from "lucide-react";
import { Link } from "react-router-dom";
import { useRouteContext } from "../context/RouteContext";
import RouteMap from "../components/RouteMap";
import SegmentDetailDrawer from "../components/SegmentDetailDrawer";
import SegmentRiskBadge from "../components/SegmentRiskBadge";
import type { RouteSegment } from "../types/route";
import { buildRouteGeometry } from "../components/RouteMap";
import type { LatLngTuple } from "leaflet";

const riskColor = (score: number) => score >= 75 ? "#B93535" : score >= 50 ? "#D36128" : score >= 30 ? "#D99B26" : "#2E7D5B";

const RouteResults = () => {
  const { routeData, alternateData, origin, destination, loading, error, acceptAlternateRoute } = useRouteContext();
  const [activeSegment, setActiveSegment] = useState<RouteSegment | null>(null);
  const [driveIndex, setDriveIndex] = useState(0);
  const [driving, setDriving] = useState(false);
  const [driveAlert, setDriveAlert] = useState<RouteSegment | null>(null);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  if (loading) return <div className="pt-32 text-center font-body-lg">Analyzing your route with real data...</div>;
  if (error) return <div className="pt-32 text-center font-body-lg text-error">{error}</div>;
  if (!routeData) return (
    <div className="pt-32 text-center font-body-lg flex flex-col items-center gap-space-md">
      <p>No route yet — go plan one first.</p>
      <Link to="/route-planner" className="btn btn-primary">Go to Route Planner</Link>
    </div>
  );

  const { route_total_risk, segments } = routeData;
  const primaryColor = riskColor(route_total_risk);
  const hazardCount = segments.filter(s => s.waterlogging_flag || s.news_flags?.length || s.vision_severity !== "none").length;
  const worstSegment = segments.reduce((worst, s) => !worst || s.final_score > worst.final_score ? s : worst, segments[0]);
  const showAlternate = alternateData?.alternate_available && alternateData.should_suggest_alternate;
  const routePoints = useMemo(() => buildRouteGeometry(segments), [segments]);
  const drivePosition: LatLngTuple | null = routePoints[driveIndex] ?? null;

  useEffect(() => {
    if (!driving || !routePoints.length) return;
    const timer = window.setInterval(() => {
      setDriveIndex((current) => {
        const next = current + 1;
        if (next >= routePoints.length) { setDriving(false); return current; }
        const approaching = segments.find((segment) =>
          !dismissedIds.has(segment.segment_id) &&
          segment.coordinates.some(([lat, lng]) => Math.abs(lat - routePoints[next][0]) < 0.00015 && Math.abs(lng - routePoints[next][1]) < 0.00015)
          && (segment.final_score >= 50 || segment.waterlogging_flag || Boolean(segment.news_flags?.length))
        );
        if (approaching) {
          setDriveAlert(approaching);
          setDriving(false);
        }
        return next;
      });
    }, 700);
    return () => window.clearInterval(timer);
  }, [driving, routePoints, segments, dismissedIds]);

  const stopDrive = () => { setDriving(false); setDriveIndex(0); setDriveAlert(null); setDismissedIds(new Set()); };
  const continueDrive = () => {
    if (driveAlert) setDismissedIds((prev) => new Set(prev).add(driveAlert.segment_id));
    setDriveAlert(null);
    setDriving(true);
  };
  const acceptReroute = () => { if (acceptAlternateRoute()) stopDrive(); };
  const downloadSafetyReport = () => {
    const report = new jsPDF({ orientation: "landscape", unit: "mm", format: "a3" });
    const pageWidth = report.internal.pageSize.getWidth();
    const pageHeight = report.internal.pageSize.getHeight();
    const margin = 12;
    const truncate = (value: string, maxLength: number) => value.length > maxLength ? `${value.slice(0, maxLength - 1)}…` : value;
    const flagStatus = (segment: RouteSegment) => [
      segment.waterlogging_flag ? "Waterlogging" : "",
      ...(segment.news_flags ?? []).length ? "News" : "",
    ].filter(Boolean).join(", ") || "None";

    report.setTextColor(26, 26, 24);
    report.setFont("helvetica", "bold");
    report.setFontSize(20);
    report.text("SafeRoute Telangana — Safety Report", margin, 18);
    report.setFont("helvetica", "normal");
    report.setFontSize(9);
    report.text(`Route: ${origin} → ${destination}`, margin, 26);
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

  return (
    <div className="w-full pt-20 bg-background min-h-screen pb-space-3xl">
      <div className="max-w-[1440px] mx-auto px-layout-margin-mobile md:px-layout-margin-tablet lg:px-layout-margin-desktop pt-space-xl">

        <div className="flex justify-between items-end flex-wrap gap-space-md mb-space-xl">
          <div className="flex flex-col gap-space-xs">
            <span className="font-label-caps-micro text-label-caps-micro uppercase text-secondary font-bold tracking-widest bg-secondary-container/20 px-space-sm py-space-2xs rounded-full self-start">Real-Data Route Analysis</span>
            <h1 className="font-display-hero text-display-hero text-on-surface tracking-tight font-medium max-w-2xl leading-tight">{origin} → {destination}</h1>
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
            <button type="button" onClick={downloadSafetyReport} className="btn btn-primary">Download Safety Report</button>
            <button type="button" onClick={() => setActiveSegment(worstSegment)} className="btn btn-outline">Inspect this segment</button>
          </div>
        </div>

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
                <p className="font-body-sm text-on-surface-variant">No meaningfully safer alternate was found for this trip — this route is already close to the best available option.</p>
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
              <button type="button" onClick={() => setDriving(!driving)} disabled={!routePoints.length} className="btn btn-primary">{driving ? <Pause size={16}/> : <Play size={16}/>} {driving ? "Pause" : driveIndex ? "Resume" : "Start"}</button>
              <button type="button" onClick={stopDrive} className="btn btn-outline"><Square size={15}/> Stop</button>
            </div>
            {driveAlert && <div className="rounded-xl border border-[#D36128]/30 bg-[#FAEEE8] p-space-md"><div className="flex flex-wrap items-center justify-between gap-space-sm"><div><b>Upcoming: {driveAlert.waterlogging_flag ? "waterlogging" : driveAlert.news_flags?.[0] ?? driveAlert.vision_severity + " surface hazard"} near {driveAlert.road_name}</b><p className="font-body-sm mt-space-2xs">Risk {driveAlert.final_score}/100. Choose whether to continue or use the available safer alternate.</p></div><div className="flex gap-space-xs"><button type="button" className="btn btn-outline" onClick={continueDrive}>Continue</button>{showAlternate && <button type="button" className="btn btn-primary" onClick={acceptReroute}>Accept safer route</button>}</div></div></div>}

            <div className="bg-surface-container-lowest p-space-md rounded-xl flex items-center gap-space-md border border-surface-variant shadow-sm">
              <div className="w-10 h-10 shrink-0 rounded-full bg-secondary-container/20 flex items-center justify-center text-secondary border border-secondary/30">
                <Zap size={20} />
              </div>
              <div>
                <div className="font-headline-sm font-semibold">{segments.length} segments · {hazardCount} with an active hazard signal</div>
                <div className="font-body-sm text-on-surface-variant">Historical crash data, live weather, live traffic, waterlogging fusion, road-surface vision, and local news — click any segment for the full breakdown.</div>
                <div className="font-label-caps-micro text-label-caps-micro uppercase text-on-surface-variant mt-space-2xs">Sources: IIT Delhi · Open-Meteo · TomTom · YOLOv8 · Google News RSS</div>
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
                    <div className="font-body-sm text-on-surface-variant mt-space-2xs flex items-center gap-space-xs">
                      <Eye size={12} /> {seg.vision_severity} surface · {seg.traffic_level} traffic
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
          <Link to="/analytics" className="font-body-sm text-secondary hover:underline font-semibold">Open the Analytics Heatmap →</Link>
        </div>
      </div>

      <SegmentDetailDrawer segment={activeSegment} onClose={() => setActiveSegment(null)} />
    </div>
  );
};

export default RouteResults;
