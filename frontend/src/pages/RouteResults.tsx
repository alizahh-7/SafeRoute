//frontend/src/pages/RouteResults.tsx

import { useState } from "react";
import { Navigation, ShieldCheck, AlertTriangle, Zap, Eye, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useRouteContext } from "../context/RouteContext";
import RouteMap from "../components/RouteMap";
import SegmentDetailDrawer from "../components/SegmentDetailDrawer";
import SegmentRiskBadge from "../components/SegmentRiskBadge";
import type { RouteSegment } from "../types/route";

const riskColor = (score: number) => score >= 75 ? "#B93535" : score >= 50 ? "#D36128" : score >= 30 ? "#D99B26" : "#2E7D5B";

const RouteResults = () => {
  const { routeData, alternateData, origin, destination, loading, error } = useRouteContext();
  const [activeSegment, setActiveSegment] = useState<RouteSegment | null>(null);

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

  return (
    <div className="w-full pt-20 bg-background min-h-screen pb-space-3xl">
      <div className="max-w-[1440px] mx-auto px-layout-margin-mobile md:px-layout-margin-tablet lg:px-layout-margin-desktop pt-space-xl">

        {/* Header */}
        <div className="flex justify-between items-end flex-wrap gap-space-md mb-space-xl">
          <div className="flex flex-col gap-space-xs">
            <span className="font-label-caps-micro text-label-caps-micro uppercase text-secondary font-bold tracking-widest bg-secondary-container/20 px-space-sm py-space-2xs rounded-full self-start">Real-Data Route Analysis</span>
            <h1 className="font-display-hero text-display-hero text-on-surface tracking-tight font-medium max-w-2xl leading-tight">{origin} → {destination}</h1>
          </div>
          <div className="text-right">
            <div className="font-display-hero text-display-hero font-semibold leading-none" style={{ color: primaryColor }}>{route_total_risk}</div>
            <div className="font-label-caps-micro text-label-caps-micro font-bold text-on-surface-variant uppercase mt-space-2xs">Overall risk / 100</div>
          </div>
        </div>

        {/* Explanation strip — the actual headline answer, front and center */}
        <div className="rounded-xl border-2 p-space-lg mb-space-xl bg-surface-container-lowest flex flex-col sm:flex-row justify-between gap-space-md items-start sm:items-center" style={{ borderColor: primaryColor }}>
          <div>
            <p className="font-body-md"><b>Riskiest point on this route:</b> {worstSegment.road_name} ({worstSegment.final_score}/100)</p>
            <p className="font-body-sm text-on-surface-variant mt-space-2xs">{worstSegment.explanation}</p>
          </div>
          <button onClick={() => setActiveSegment(worstSegment)} className="btn btn-outline shrink-0">Inspect this segment</button>
        </div>

        {/* Alternate route callout, only if genuinely justified */}
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

        {/* Map + Segment list */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
          <div className="lg:col-span-7 flex flex-col gap-space-md">
            <div className="rounded-xl overflow-hidden border border-surface-variant shadow-sm h-[420px]">
              <RouteMap segments={segments} />
            </div>
            <p className="font-body-sm text-on-surface-variant text-center">Route line is illustrative — segment scores and coordinates below are real.</p>

            <div className="bg-surface-container-lowest p-space-md rounded-xl flex items-center gap-space-md border border-surface-variant shadow-sm">
              <div className="w-10 h-10 shrink-0 rounded-full bg-secondary-container/20 flex items-center justify-center text-secondary border border-secondary/30">
                <Zap size={20} />
              </div>
              <div>
                <div className="font-headline-sm font-semibold">{segments.length} segments · {hazardCount} with an active hazard signal</div>
                <div className="font-body-sm text-on-surface-variant">Historical crash data, live weather, live traffic, waterlogging fusion, road-surface vision, and local news — click any segment for the full breakdown.</div>
              </div>
            </div>
          </div>

          {/* Segment list */}
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
