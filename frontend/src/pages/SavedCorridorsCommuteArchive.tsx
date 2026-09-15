import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { jsPDF } from "jspdf";
import { ArrowLeft, Bell, Bookmark, ChevronRight, CloudRain, Download, Plus, ShieldCheck } from "lucide-react";
import { useRouteContext } from "../context/RouteContext";
import type { RouteSegment } from "../types/route";

const shell = "w-full max-w-[1440px] mx-auto px-layout-margin-mobile md:px-layout-margin-tablet lg:px-layout-margin-desktop";
const presets = [["Home to HITEC City", "Four-wheeler", "Kothaguda flyover"], ["Banjara Hills Rd No. 12 to Secunderabad", "Two-wheeler", "Begumpet underpass"], ["Jubilee Hills to Shamshabad Airport", "Four-wheeler", "PVNR Elevated Expressway"], ["Kukatpally Housing Board to Ameerpet", "Two-wheeler", "NH-65 Metro construction"]] as const;

type Corridor = RouteSegment & { title: string; mode: string; context: string };

function exportSafetyReport(corridors: Corridor[], origin: string, destination: string) {
  const report = new jsPDF({ unit: "mm", format: "a4" });
  const width = report.internal.pageSize.getWidth();
  const margin = 16;
  let y = 18;
  const write = (text: string, size = 9, bold = false, colour: [number, number, number] = [26, 26, 24]) => {
    report.setFont("helvetica", bold ? "bold" : "normal"); report.setFontSize(size); report.setTextColor(...colour);
    const lines = report.splitTextToSize(text, width - margin * 2);
    if (y + lines.length * (size * 0.46) > 275) { report.addPage(); y = 18; }
    report.text(lines, margin, y); y += lines.length * (size * 0.46) + 3;
  };
  const rule = () => { report.setDrawColor(222, 220, 213); report.line(margin, y, width - margin, y); y += 5; };
  write("SafeRoute Telangana", 18, true); write("Saved Corridor Safety Report", 12, true, [164, 120, 20]);
  write(`Generated ${new Date().toLocaleString()} · Loaded route: ${origin || "origin unavailable"} → ${destination || "destination unavailable"}`, 8, false, [92, 90, 84]); rule();
  write("Report summary", 12, true); write(`${corridors.length} saved corridor${corridors.length === 1 ? "" : "s"} included. Scores and signals are taken from the current loaded route data; no historic or live values have been fabricated for this export.`); rule();
  corridors.forEach((corridor, index) => {
    write(`${String(index + 1).padStart(2, "0")}  ${corridor.title}`, 12, true);
    write(`${corridor.context} · ${corridor.mode} · Actual road segment: ${corridor.road_name}`, 8, false, [92, 90, 84]);
    write(`Risk summary: ${corridor.final_score}/100 composite risk. Historical score: ${corridor.historical_score}/100. Traffic: ${corridor.traffic_status === "unavailable" ? "unavailable" : corridor.traffic_level}. Weather: ${corridor.weather_status === "unavailable" ? "unavailable" : corridor.weather_modifier ? `+${corridor.weather_modifier} score lift` : "live clear, no score lift"}.`, 9);
    const hazards = [corridor.waterlogging_flag ? "waterlogging proximity" : null, corridor.vision_severity !== "none" ? `${corridor.vision_severity} surface signal` : null, ...(corridor.news_flags ?? [])].filter(Boolean);
    write(`Hazards and signals: ${hazards.length ? hazards.join("; ") : "No active waterlogging, vision, or news hazard flagged."}`, 9);
    write(`Safety narrative: ${corridor.explanation}`, 9); rule();
  });
  write("Data sources", 11, true); write("IIT Delhi Telangana crash dataset · Open-Meteo live weather · TomTom live traffic · YOLOv8 road-surface detection · Google News RSS · OpenRouteService route geometry", 8, false, [92, 90, 84]);
  report.save("SafeRoute-Saved-Corridors-Safety-Report.pdf");
}

export default function SavedCorridorsCommuteArchive() {
  const { routeData, origin, destination } = useRouteContext();
  const segments = routeData?.segments ?? [];
  const [saved, setSaved] = useState<number[]>([0, 1, 2, 3]);
  const [mode, setMode] = useState("All modes");
  useEffect(() => { document.title = "Saved Corridors & Historical Commute Archive | SafeRoute Telangana"; }, []);
  const cards = useMemo(() => presets.reduce<Corridor[]>((items, preset, index) => {
    const segment = segments[index];
    if (segment) items.push({ ...segment, title: preset[0], mode: preset[1], context: preset[2] });
    return items;
  }, []), [segments]);
  const savedCards = cards.filter((_, index) => saved.includes(index));
  const shown = savedCards.filter(item => mode === "All modes" || item.mode === mode);
  const avg = savedCards.length ? Math.round(savedCards.reduce((sum, item) => sum + item.final_score, 0) / savedCards.length) : 0;
  return <div className="pt-20 pb-space-3xl bg-background min-h-screen"><div className={`${shell} pt-space-xl`}>
    <div className="flex justify-between gap-space-md items-center font-body-sm text-on-surface-variant"><Link to="/route-planner" className="inline-flex gap-space-xs items-center"><ArrowLeft size={16}/>Safe Route Finder</Link><span>Current route data · saved locally in this view</span></div>
    <div className="flex flex-col lg:flex-row justify-between gap-space-lg mt-space-lg"><div><span className="font-label-caps-micro uppercase text-secondary">Commute intelligence / saved corridors &amp; history</span><h1 className="font-headline-lg mt-space-xs">Monitored Daily Corridors &amp; Commute Safety Archive</h1><p className="font-body-md text-on-surface-variant mt-space-xs max-w-2xl">Pre-departure risk context for repeated routes. This archive uses safety signals from the currently loaded route.</p></div><div className="flex gap-space-sm self-start"><button type="button" disabled={!savedCards.length} onClick={() => exportSafetyReport(savedCards, origin, destination)} className="btn btn-outline disabled:opacity-50"><Download size={16}/>Download safety report</button><button type="button" onClick={() => setSaved((current) => [...new Set([...current, 0])])} className="btn btn-primary"><Plus size={16}/>Add regular commute</button></div></div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-space-md mt-space-xl">{[["Active monitored paths", savedCards.length], ["Mean safety index", `${avg}/100`], ["Active hazard corridors", savedCards.filter(item => item.waterlogging_flag || item.news_flags?.length).length], ["Vision signals", savedCards.filter(item => item.vision_severity !== "none").length]].map(([label, value]) => <article key={String(label)} className="p-space-lg bg-surface-container-lowest rounded-xl border border-surface-variant shadow-sm"><span className="font-label-caps-micro uppercase text-on-surface-variant">{label}</span><div className="text-4xl mt-space-lg">{value}</div><p className="font-body-sm text-on-surface-variant mt-space-xs">Derived from saved, loaded segments</p></article>)}</div>
    <section className="mt-space-xl"><div className="flex flex-col sm:flex-row justify-between gap-space-md"><div><h2 className="font-headline-md">Automated Commute Watchlist</h2><p className="font-body-sm text-on-surface-variant">Each card opens its live segment diagnostics.</p></div><div className="flex rounded-full bg-surface-container-low p-1 self-start">{["All modes", "Two-wheeler", "Four-wheeler"].map(item => <button key={item} type="button" onClick={() => setMode(item)} className={`px-space-md py-space-xs rounded-full font-body-sm ${mode === item ? "bg-on-surface text-surface" : ""}`}>{item}</button>)}</div></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg mt-space-lg">{shown.map(c => { const cardIndex = cards.indexOf(c); return <article key={c.segment_id} className="rounded-[1.75rem] bg-surface-container-lowest border border-surface-variant p-space-lg shadow-sm"><div className="flex justify-between gap-space-sm"><div><span className="font-label-caps-micro uppercase text-secondary">{c.waterlogging_flag ? "Active reroute alert" : "Primary office commute"}</span><h3 className="font-headline-sm mt-space-xs">{c.title}</h3><p className="font-body-sm text-on-surface-variant">{c.context} · {c.mode}</p></div><span className="font-label-caps-micro rounded-full px-space-sm py-space-2xs bg-surface-container-low">{c.final_score}/100 risk</span></div><div className="mt-space-md p-space-md bg-surface-container-low rounded-xl font-body-sm"><div className="flex justify-between"><span>{c.traffic_status === "unavailable" ? "traffic unavailable" : `${c.traffic_level} traffic`} · {c.vision_severity} vision</span><span>{c.waterlogging_flag ? <><CloudRain size={14} className="inline text-[#B93535]"/> waterlogging</> : <><ShieldCheck size={14} className="inline text-[#2E7D5B]"/> clear</>}</span></div><p className="mt-space-xs text-on-surface-variant">{c.explanation}</p></div><div className="flex justify-between mt-space-md"><button type="button" onClick={() => setSaved(current => current.includes(cardIndex) ? current.filter(item => item !== cardIndex) : [...current, cardIndex])} className="font-body-sm inline-flex gap-space-xs items-center"><Bookmark size={15} fill={saved.includes(cardIndex) ? "currentColor" : "none"}/>{saved.includes(cardIndex) ? "Saved" : "Save corridor"}</button><Link to={`/segment/${c.segment_id}`} className="font-body-sm text-secondary inline-flex gap-space-xs items-center">Inspect leg <ChevronRight size={16}/></Link></div></article>; })}</div>
    </section>
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg mt-space-xl"><section className="lg:col-span-8 rounded-[1.75rem] bg-surface-container-lowest border border-surface-variant p-space-lg"><span className="font-label-caps-micro uppercase text-secondary">Saved corridor index</span><h2 className="font-headline-md mt-space-xs">Current safety ledger</h2><div className="mt-space-md divide-y divide-surface-variant">{savedCards.map(c => <Link key={c.segment_id} to={`/segment/${c.segment_id}`} className="flex justify-between gap-space-md py-space-md hover:bg-surface-container-low"><span className="font-body-sm">{c.title}</span><span className="font-body-sm text-on-surface-variant">Risk {c.final_score}/100 · {c.waterlogging_flag ? "Waterlogging flagged" : "No inundation flag"}</span></Link>)}</div></section><aside className="lg:col-span-4 rounded-[1.75rem] bg-surface-container-low p-space-lg"><span className="font-label-caps-micro uppercase text-secondary">Corridor provisioning</span><h2 className="font-headline-md mt-space-xs">How corridors are indexed</h2><p className="font-body-sm text-on-surface-variant mt-space-md">A future saved-corridor service can persist the same segment IDs, route metadata, and alert preferences used here.</p><button type="button" onClick={() => setSaved(cards.map((_, index) => index))} className="btn btn-primary w-full mt-space-lg"><Bell size={16}/>Enable route watchlist</button></aside></div>
  </div></div>;
}
