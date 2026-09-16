import RiskHeatmapMap from "../components/RiskHeatmapMap";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Activity, AlertTriangle, ChevronRight, Clock3, Eye, Radar } from "lucide-react";
import { useRouteContext } from "../context/RouteContext";

const shell = "w-full max-w-[1440px] mx-auto px-layout-margin-mobile md:px-layout-margin-tablet lg:px-layout-margin-desktop";
const color = (score: number) => score >= 75 ? "#B93535" : score >= 50 ? "#D36128" : score >= 30 ? "#D99B26" : "#2E7D5B";
const dominantFactor = (item: { historical_score: number; weather_modifier: number; traffic_level: string; waterlogging_flag: boolean; vision_severity: string; news_flags: string[] | null }) => {
  const candidates = [
    ["historical crash pattern", item.historical_score], ["live weather", item.weather_modifier], ["live traffic", item.traffic_level === "severe" ? 20 : item.traffic_level === "high" ? 12 : item.traffic_level === "medium" ? 5 : 0],
    ["inundation proximity", item.waterlogging_flag ? 15 : 0], ["road-surface vision", item.vision_severity === "severe" ? 22 : item.vision_severity === "moderate" ? 12 : item.vision_severity === "minor" ? 5 : 0], ["news advisory", item.news_flags?.length ? 15 : 0],
  ] as const;
  return candidates.reduce((highest, candidate) => candidate[1] > highest[1] ? candidate : highest)[0];
};

export default function LiveAnalyticsRiskHeatmap() {
  const { routeData } = useRouteContext();
  const segments = routeData?.segments ?? [];
  const [filter, setFilter] = useState<"all" | "hazards" | "surface">("all");
  const [activeTrajectoryIndex, setActiveTrajectoryIndex] = useState(0);
  const [selectedBucket, setSelectedBucket] = useState("All");

  useEffect(() => {
    document.title = "LIVE ANALYTICS & RISK HEATMAP | SafeRoute Telangana";
  }, []);

  const filtered = useMemo(
    () =>
      segments.filter(item =>
        filter === "all" || filter === "hazards"
          ? filter === "all" || item.waterlogging_flag || item.news_flags?.length
          : item.vision_severity !== "none"
      ),
    [segments, filter]
  );

  const average = segments.length
    ? Math.round(segments.reduce((sum, item) => sum + item.final_score, 0) / segments.length)
    : 0;

  const signals = segments.filter(item => item.waterlogging_flag || item.news_flags?.length).length;
  const affectedSegments = segments.filter(item => item.final_score >= 50 || item.waterlogging_flag || item.news_flags?.length).length;
  const highestRisk = segments.reduce<typeof segments[number] | null>((highest, item) => !highest || item.final_score > highest.final_score ? item : highest, null);
  const routeDelta = segments.length > 1 ? Math.round((segments[segments.length - 1].final_score - segments[0].final_score) * 10) / 10 : 0;

  const trajectory = useMemo(() => segments.map((item, index) => ({
    ...item,
    index,
    weatherActive: item.weather_modifier > 0,
    trafficActive: item.traffic_level === "medium" || item.traffic_level === "high" || item.traffic_level === "severe",
  })), [segments]);
  const activeTrajectory = trajectory[activeTrajectoryIndex] ?? trajectory[0];
  const detectionEvents = useMemo(() => segments.flatMap((item) => {
    const events: { segment: typeof item; kind: string; detail: string }[] = [];
    if (item.vision_severity !== "none") events.push({ segment: item, kind: "Vision", detail: `${item.vision_severity} surface assessment` });
    if (item.waterlogging_flag) events.push({ segment: item, kind: "Inundation", detail: "Waterlogging proximity signal" });
    if (item.weather_modifier > 0) events.push({ segment: item, kind: "Weather", detail: `Live weather adds ${item.weather_modifier} risk points` });
    if (item.traffic_level === "medium" || item.traffic_level === "high" || item.traffic_level === "severe") events.push({ segment: item, kind: "Traffic", detail: `${item.traffic_level} live congestion` });
    (item.news_flags ?? []).forEach((headline) => events.push({ segment: item, kind: "News", detail: headline }));
    return events;
  }), [segments]);
  const riskBuckets = useMemo(() => [
    { label: "Low", range: "0–29", tint: "#2E7D5B", items: segments.filter(item => item.final_score < 30) },
    { label: "Moderate", range: "30–49", tint: "#D99B26", items: segments.filter(item => item.final_score >= 30 && item.final_score < 50) },
    { label: "High", range: "50–74", tint: "#D36128", items: segments.filter(item => item.final_score >= 50 && item.final_score < 75) },
    { label: "Severe", range: "75–100", tint: "#B93535", items: segments.filter(item => item.final_score >= 75) },
  ], [segments]);
  const selectedBucketItems = selectedBucket === "All" ? segments : riskBuckets.find(bucket => bucket.label === selectedBucket)?.items ?? [];

  return (
    <div className="pt-20 pb-space-3xl min-h-screen bg-background">
      <div className={`${shell} pt-space-xl`}>
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-space-lg">
          <div>
            <span className="font-label-caps-micro text-secondary uppercase">Route analytics workspace</span>
            <h1 className="font-headline-lg mt-space-xs">LIVE ANALYTICS &amp; RISK HEATMAP</h1>
            <p className="font-body-md text-on-surface-variant mt-space-xs max-w-2xl">
              A spatial summary of the loaded route data. Live GIS and camera feeds require a backend endpoint and are shown only when supplied.
            </p>
          </div>

          <div className="inline-flex self-start p-1 rounded-full bg-surface-container-low border border-surface-variant">
            {([["all", "All signals"], ["hazards", "Hazards"], ["surface", "Vision"]] as const).map(([value, label]) => (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={`px-space-md py-space-xs rounded-full font-body-sm ${
                  filter === value ? "bg-on-surface text-surface" : "text-on-surface-variant"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-space-md mt-space-xl">
          <Metric icon={<Radar />} label="Mapped corridors" value={segments.length} note="Loaded route segments" />
          <Metric icon={<Activity />} label="Mean composite risk" value={`${average}/100`} note="Fused score average" />
          <Metric icon={<AlertTriangle />} label="Hazard signals" value={signals} note="News or inundation flags" />
          <Metric
            icon={<Eye />}
            label="Vision detections"
            value={segments.filter(item => item.vision_severity !== "none").length}
            note="Route adapter imagery"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg mt-space-xl">
          <section className="lg:col-span-8 rounded-[1.75rem] bg-surface-container-lowest border border-surface-variant p-space-lg shadow-sm">
            <div className="flex justify-between items-start gap-space-md">
              <div>
                <span className="font-label-caps-micro uppercase text-secondary">Geo-spatial risk matrix</span>
                <h2 className="font-headline-md mt-space-xs">Corridor heatmap</h2>
              </div>
              <span className="font-body-sm text-on-surface-variant">Visualization based on segment midpoints</span>
            </div>

            <div className="relative h-[420px] rounded-xl mt-space-lg overflow-hidden">
              <RiskHeatmapMap segments={filtered} />
            </div>
          </section>

          <aside className="lg:col-span-4 rounded-[1.75rem] bg-surface-container-lowest border border-surface-variant p-space-lg shadow-sm">
            <span className="font-label-caps-micro uppercase text-secondary">Risk distribution</span>
            <h2 className="font-headline-md mt-space-xs">Score profile</h2>

            <p className="font-body-sm text-on-surface-variant mt-space-xs">{segments.length} loaded segments · bucket totals always equal the route total.</p>
            <div className="mt-space-lg flex h-5 overflow-hidden rounded-full bg-surface-container">
              {riskBuckets.map(bucket => bucket.items.length ? <span key={bucket.label} title={`${bucket.label}: ${bucket.items.length}`} style={{ width: `${bucket.items.length / segments.length * 100}%`, backgroundColor: bucket.tint }} /> : null)}
            </div>
            <div className="mt-space-lg space-y-space-sm">{riskBuckets.map(bucket => <button type="button" key={bucket.label} onClick={() => setSelectedBucket(current => current === bucket.label ? "All" : bucket.label)} className={`w-full text-left flex items-center gap-space-sm rounded-lg p-space-xs transition-colors ${selectedBucket === bucket.label ? "bg-surface-container" : "hover:bg-surface-container-low"}`}><i className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: bucket.tint }} /><div className="flex-1"><div className="flex justify-between font-body-sm"><span>{bucket.label} <span className="text-on-surface-variant">{bucket.range}</span></span><b>{bucket.items.length} · {segments.length ? Math.round(bucket.items.length / segments.length * 100) : 0}%</b></div><div className="h-1.5 rounded-full bg-surface-container mt-1"><div className="h-full rounded-full" style={{ width: `${segments.length ? bucket.items.length / segments.length * 100 : 0}%`, backgroundColor: bucket.tint }} /></div></div></button>)}</div>
            <div className="mt-space-lg pt-space-md border-t border-surface-variant"><p className="font-label-caps-micro uppercase text-on-surface-variant mb-space-sm">Route-order intensity bars</p><div className="flex h-16 items-end gap-1">{segments.map(item => <Link key={item.segment_id} to={`/segment/${item.segment_id}`} title={`${item.road_name}: ${item.final_score}/100`} className="flex-1 rounded-t-sm min-w-1 transition-transform hover:-translate-y-1" style={{ height: `${Math.max(15, item.final_score)}%`, backgroundColor: color(item.final_score) }} />)}</div></div>
            <div className="mt-space-md border-t border-surface-variant pt-space-md"><p className="font-label-caps-micro uppercase text-on-surface-variant">{selectedBucket === "All" ? "Select a bucket to inspect its segments" : `${selectedBucket} segments · click for diagnostics`}</p>{selectedBucket !== "All" && <div className="mt-space-xs flex flex-wrap gap-space-xs">{selectedBucketItems.map(item => <Link key={item.segment_id} to={`/segment/${item.segment_id}`} className="font-body-sm px-space-sm py-space-2xs rounded-full bg-surface-container-low hover:bg-secondary-container/30">{item.road_name}</Link>)}</div>}</div>
          </aside>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg mt-space-xl">
          <section className="lg:col-span-7 rounded-[1.75rem] bg-surface-container-lowest border border-surface-variant p-space-lg shadow-sm">
            <div className="flex justify-between gap-space-md">
              <div>
                <span className="font-label-caps-micro uppercase text-secondary">AI-calibrated route outlook</span>
                <h2 className="font-headline-md mt-space-xs">Route Risk System</h2>
              </div>
              <span className="font-body-sm text-on-surface-variant">Current loaded route state · not a future prediction</span>
            </div>
            {trajectory.length ? <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-space-sm mt-space-lg">
                <div className="rounded-xl bg-on-surface p-space-md text-surface"><span className="font-label-caps-micro uppercase text-surface/70">Current route risk</span><b className="block text-4xl mt-space-xs">{average}<small className="text-base">/100</small></b></div>
                <div className="rounded-xl bg-surface-container-low p-space-md"><span className="font-label-caps-micro uppercase text-on-surface-variant">Affected segments</span><b className="block text-4xl mt-space-xs">{affectedSegments}<small className="text-base">/{segments.length}</small></b></div>
                <div className="rounded-xl bg-surface-container-low p-space-md"><span className="font-label-caps-micro uppercase text-on-surface-variant">Highest-risk node</span><b className="block text-xl mt-space-xs truncate">{highestRisk?.road_name}</b><span className="font-body-sm">{highestRisk?.final_score}/100</span></div>
                <div className="rounded-xl bg-surface-container-low p-space-md"><span className="font-label-caps-micro uppercase text-on-surface-variant">Route direction</span><b className="block text-xl mt-space-xs">{routeDelta > 0 ? "Rising" : routeDelta < 0 ? "Easing" : "Stable"}</b><span className="font-body-sm">{routeDelta === 0 ? "No change" : `${Math.abs(routeDelta)} pts end to end`}</span></div>
              </div>
              <div className="mt-space-lg rounded-[1.75rem] border border-surface-variant bg-[#F7F4EC] p-space-lg">
                <div className="flex flex-wrap justify-between gap-space-md"><div><span className="font-label-caps-micro uppercase text-secondary">Current exposure field</span><p className="font-body-sm text-on-surface-variant mt-space-2xs">A woven signal field for this route—not a map or forecast. Thickness shows the contribution of each real signal at each segment.</p></div><span className="font-body-sm text-on-surface-variant">Hover or select a segment column to inspect</span></div>
                <svg viewBox="0 0 760 330" className="w-full h-[24rem] mt-space-md" role="img" aria-label="Interactive current route exposure field">
                  <defs><linearGradient id="routePulse" x1="0" x2="1"><stop stopColor="#D4A234"/><stop offset=".5" stopColor="#E8C55B"/><stop offset="1" stopColor="#D4A234"/></linearGradient></defs>
                  {[{ label: "Historical", y: 67, tint: "#7E5A10", value: (item: typeof trajectory[number]) => item.historical_score }, { label: "Weather", y: 117, tint: "#3A7CA5", value: (item: typeof trajectory[number]) => item.weather_modifier * 4 }, { label: "Traffic", y: 167, tint: "#D36128", value: (item: typeof trajectory[number]) => item.traffic_level === "severe" ? 80 : item.traffic_level === "high" ? 56 : item.traffic_level === "medium" ? 30 : 8 }, { label: "Surface", y: 217, tint: "#825AA5", value: (item: typeof trajectory[number]) => item.vision_severity === "severe" ? 88 : item.vision_severity === "moderate" ? 56 : item.vision_severity === "minor" ? 30 : 8 }, { label: "Incident", y: 267, tint: "#B93535", value: (item: typeof trajectory[number]) => item.waterlogging_flag || item.news_flags?.length ? 88 : 8 }].map(row => <g key={row.label}><text x="4" y={row.y + 4} fontSize="11" fill="#716F69">{row.label}</text><line x1="82" x2="742" y1={row.y} y2={row.y} stroke="#DEDCD5" strokeWidth="2"/>{trajectory.slice(0, -1).map((item, index) => { const next = trajectory[index + 1]; const x1 = 86 + index * (650 / Math.max(trajectory.length - 1, 1)); const x2 = 86 + (index + 1) * (650 / Math.max(trajectory.length - 1, 1)); const current = row.value(item); const nextValue = row.value(next); return <path key={`${row.label}-${item.segment_id}`} d={`M ${x1} ${row.y} C ${x1 + 18} ${row.y - current / 5}, ${x2 - 18} ${row.y - nextValue / 5}, ${x2} ${row.y}`} fill="none" stroke={row.tint} strokeWidth={Math.max(3, (current + nextValue) / 18)} strokeLinecap="round" opacity=".78"/>; })}</g>)}
                  <path d="M82 306 H742" stroke="url(#routePulse)" strokeWidth="10" strokeLinecap="round"/><text x="82" y="325" fontSize="10" fill="#716F69">ORIGIN</text><text x="704" y="325" fontSize="10" fill="#716F69">DESTINATION</text>
                  {trajectory.map((item, index) => { const x = 86 + index * (650 / Math.max(trajectory.length - 1, 1)); const active = index === activeTrajectoryIndex; return <g key={item.segment_id}><title>{`${item.road_name}: ${item.final_score}/100. Dominant factor: ${dominantFactor(item)}.`}</title><line x1={x} x2={x} y1="38" y2="307" stroke={active ? "#1A1A18" : "#1A1A18"} strokeWidth={active ? "3" : "1"} opacity={active ? ".48" : ".1"}/><circle cx={x} cy="306" r={active ? "10" : "6"} fill={color(item.final_score)} stroke="#fff" strokeWidth="2"/>{(item.waterlogging_flag || item.news_flags?.length) && <circle cx={x} cy="26" r="5" fill="#1A1A18"/>}<rect x={x - 16} y="18" width="32" height="292" fill="transparent" className="cursor-pointer" onClick={() => setActiveTrajectoryIndex(index)}/></g>; })}
                </svg>
              </div>
              <div className="rounded-xl bg-surface-container-low p-space-md flex flex-wrap items-center justify-between gap-space-sm">
                <div><span className="font-label-caps-micro uppercase text-secondary">Selected segment {String((activeTrajectory?.index ?? 0) + 1).padStart(2, "0")}</span><p className="font-body-md mt-space-2xs font-semibold">{activeTrajectory?.road_name} · {activeTrajectory?.final_score}/100</p></div>
                <div className="font-body-sm text-on-surface-variant">Dominant factor: {activeTrajectory ? dominantFactor(activeTrajectory) : "—"} · {activeTrajectory?.waterlogging_flag || activeTrajectory?.news_flags?.length ? "active advisory" : "no active advisory"}</div>
              </div>
            </> : <p className="mt-space-lg font-body-sm text-on-surface-variant">Analyze a route to plot its actual segment trajectory.</p>}
          </section>

          <aside className="lg:col-span-5 rounded-[1.75rem] bg-surface-container-lowest border border-surface-variant p-space-lg shadow-sm">
            <span className="font-label-caps-micro uppercase text-secondary">Detection feed</span>
            <h2 className="font-headline-md mt-space-xs">Active detections only</h2>

            <div className="mt-space-md divide-y divide-surface-variant">
              {detectionEvents.length ? detectionEvents.slice(0, 8).map(({ segment, kind, detail }, index) => (
                  <Link
                    key={`${segment.segment_id}-${kind}-${index}`}
                    to={`/segment/${segment.segment_id}`}
                    className="py-space-sm flex gap-space-sm hover:bg-surface-container-low transition-colors"
                  >
                    <span className="w-7 h-7 shrink-0 flex items-center justify-center rounded-full bg-surface-container text-secondary">
                      <Clock3 size={14} />
                    </span>
                    <span>
                      <b className="font-body-sm">{kind} · {segment.road_name}</b>
                      <span className="block font-body-sm text-on-surface-variant">
                        {detail} · Risk {segment.final_score}/100
                      </span>
                    </span>
                    <ChevronRight size={15} className="ml-auto mt-1 text-on-surface-variant" />
                  </Link>
                )) : <p className="py-space-md font-body-sm text-on-surface-variant">No active weather, traffic, vision, inundation, or news detections on this loaded route.</p>}
            </div>
          </aside>
        </div>

        <section className="mt-space-xl rounded-[1.75rem] bg-surface-container-low p-space-lg">
          <div className="flex justify-between items-center gap-space-md">
            <div>
              <span className="font-label-caps-micro uppercase text-secondary">Signal inventory</span>
              <h2 className="font-headline-md mt-space-xs">Complete segment telemetry</h2>
            </div>
            <span className="font-body-sm text-on-surface-variant">Click a row for the full AI breakdown</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-sm mt-space-lg">
            {filtered.map(item => (
              <Link
                key={item.segment_id}
                to={`/segment/${item.segment_id}`}
                className="bg-surface-container-lowest rounded-xl p-space-md flex justify-between gap-space-md hover:bg-secondary-container/20 transition-colors"
              >
                <div>
                  <div className="flex gap-space-xs items-center">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color(item.final_score) }} />
                    <h3 className="font-body-md font-semibold">{item.road_name}</h3>
                  </div>
                  <p className="font-body-sm text-on-surface-variant mt-space-xs">
                    {item.waterlogging_flag ? "Inundation flag" : "No inundation flag"} · {item.vision_severity} vision · {item.traffic_status === "unavailable" ? "traffic unavailable" : `${item.traffic_level} traffic`} · {item.weather_status === "unavailable" ? "weather unavailable" : item.weather_modifier ? `weather +${item.weather_modifier}` : "weather clear"}
                  </p>
                </div>

                <span className="flex items-center gap-space-xs font-label-code-md" style={{ color: color(item.final_score) }}>
                  {item.final_score}/100 <ChevronRight size={15} />
                </span>
              </Link>
            ))}
          </div>

          {!filtered.length && (
            <div className="p-space-lg text-center font-body-sm text-on-surface-variant">
              No segments match this filter.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
  note,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  note: string;
}) {
  return (
    <article className="p-space-lg rounded-xl bg-surface-container-lowest border border-surface-variant shadow-sm">
      <div className="flex justify-between text-secondary">
        <span className="font-label-caps-micro uppercase">{label}</span>
        {icon}
      </div>
      <div className="text-4xl mt-space-lg">{value}</div>
      <p className="font-body-sm text-on-surface-variant mt-space-xs">{note}</p>
    </article>
  );
}