//frontend/src/pages/CapstoneTeamShowcase.tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { Download, ArrowLeft, ExternalLink } from "lucide-react";
import { ASSETS } from "../assets.config";

const shell = "w-full max-w-[1440px] mx-auto px-layout-margin-mobile md:px-layout-margin-tablet lg:px-layout-margin-desktop";

const people: Array<[string, string, string, string, string, string]> = [
  ["Umaima", ASSETS.team.umaima, "Team Lead & Core Risk Engine", "https://github.com/umaima06", "Route intake, segmentation, historical risk scoring, and the explainable fusion engine that combines every live signal into one score.", "Backend integration owner"],
  ["Alizah", ASSETS.team.alizah, "Live Conditions & Routing Intelligence", "https://github.com/alizahh-7", "Live weather, traffic, and waterlogging-fusion signals, plus the safer alternate-route comparison logic.", "Live signals lead"],
  ["Zunairah", ASSETS.team.zunairah, "Computer Vision, News Intelligence & Frontend", "https://github.com/Zunairah-k", "YOLOv8 road-damage detection, Mapillary integration, live local news checks, and this web application.", "Full-stack & vision lead"],
  ["Shazia", ASSETS.team.shazia, "Data Curation, QA & Documentation", "https://github.com/shaziaiqbal9667", "Black-spot and waterlogging datasets, end-to-end testing across real routes, and project documentation.", "Data & QA lead"],
];

const dataSources = [
  ["Historical crashes", "IIT Delhi Mendeley Data", "\"Media-Reported Road Traffic Crash Data\", filtered to Telangana"],
  ["Known black spots", "MoRTH Black Spot MIS", "Officially identified high-risk highway locations"],
  ["Live weather", "Open-Meteo", "Rain, wind, visibility per segment coordinate"],
  ["Live traffic", "TomTom Traffic API", "Real-time congestion by location"],
  ["Waterlogging zones", "GHMC/HYDRAA published lists", "Cross-referenced with live rainfall"],
  ["Road surface vision", "YOLOv8 + RDD2022 + Mapillary", "Live street imagery, sample-image fallback"],
  ["Live local news", "Google News RSS", "Recent reports for each road segment"],
];

export default function CapstoneTeamShowcase() {
  const [file, setFile] = useState(false);

  const download = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify({ project: "SafeRoute Telangana", team: people.map(p => ({ name: p[0], role: p[2] })), dataSources }, null, 2)], { type: "application/json" }));
    a.download = "SafeRoute-Team-and-Sources.json";
    a.click();
    setFile(true);
  };

  return (
    <main className="pt-20 pb-space-3xl bg-background">
      <div className={`${shell} pt-space-xl`}>
        <Link to="/" className="font-body-sm inline-flex gap-space-xs text-on-surface-variant"><ArrowLeft size={16}/>Back to overview</Link>

        <section className="mt-space-lg">
          <span className="font-label-caps-micro text-secondary uppercase">AI Careers for Women (AICW) Capstone</span>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg mt-space-sm">
            <div className="lg:col-span-8">
              <h1 className="font-display-hero">SafeRoute Telangana — Team &amp; Real Data Sources</h1>
              <p className="font-body-md text-on-surface-variant mt-space-md max-w-3xl">
                Built by a team of four for the AICW capstone program — a road-safety layer that fuses real historical crash data, live weather and traffic, road-surface vision, and local news into one explainable risk score per route segment.
              </p>
            </div>
            <div className="lg:col-span-4 p-space-lg rounded-[1.75rem] bg-surface-container-lowest border border-surface-variant">
              <span className="font-label-caps-micro uppercase">Project status</span>
              <b className="block text-2xl mt-space-xs">Submission ready</b>
              <span className="font-body-sm text-secondary">Backend and frontend fully wired to real data Backend and frontend wired to real data — known limitations documented</span>
            </div>
          </div>
          <div className="mt-space-lg p-space-md rounded-xl bg-surface-container-low flex flex-wrap gap-space-sm items-center">
            <span className="font-body-sm mr-auto">Team roster and real data-source attribution</span>
            <button onClick={download} className="btn btn-outline"><Download size={15}/>{file ? "Downloaded" : "Download summary"}</button>
          </div>
        </section>

        <section className="mt-space-2xl">
          <span className="font-label-caps-micro text-secondary uppercase">The team</span>
          <h2 className="font-headline-lg mt-space-xs">Four engineers, four ownership areas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md mt-space-lg">
            {people.map((p) => (
              <article key={p[0]} className="rounded-[1.75rem] overflow-hidden bg-surface-container-low border border-surface-variant">
                <div className="h-40 relative bg-surface-container">
                  <img src={p[1]} alt={`${p[0]} avatar`} className="w-full h-full object-cover" />
                </div>
                <div className="p-space-md">
                  <h3 className="font-headline-sm">{p[0]}</h3>
                  <span className="font-label-caps-micro text-secondary">{p[5]}</span>
                  <p className="font-body-sm text-on-surface-variant mt-space-sm">{p[4]}</p>
                  <a href={p[3]} target="_blank" rel="noopener noreferrer" className="mt-space-md font-body-sm inline-flex items-center gap-space-2xs text-secondary hover:underline">
                    <ExternalLink size={14} /> GitHub
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-space-2xl p-space-xl bg-surface-container-low rounded-[1.75rem]">
          <span className="font-label-caps-micro text-secondary uppercase">Real data, not simulated</span>
          <h2 className="font-headline-lg mt-space-xs">Every signal traces back to a real source</h2>
          <p className="font-body-sm text-on-surface-variant mt-space-xs max-w-2xl">No signal in this app is randomly generated. Where real-time coverage is unavailable, the app says so rather than fabricating a result — see the Methodology page for stated limitations.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-sm mt-space-lg">
            {dataSources.map((d) => (
              <div key={d[0]} className="p-space-md rounded-xl bg-surface-container-lowest border border-surface-variant">
                <div className="flex justify-between">
                  <b className="font-body-sm">{d[0]}</b>
                  <span className="font-label-caps-micro text-secondary uppercase">{d[1]}</span>
                </div>
                <p className="font-body-sm text-on-surface-variant mt-space-xs">{d[2]}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-space-2xl p-space-xl bg-surface-container-low rounded-[1.75rem] text-center">
          <h2 className="font-headline-lg">See it work on a real route</h2>
          <p className="font-body-md text-on-surface-variant mt-space-sm max-w-xl mx-auto">The best demonstration of this project is trying it — enter a real Hyderabad route and see the actual computed risk score.</p>
          <Link to="/route-planner" className="btn btn-primary mt-space-lg inline-flex">Try the Safe Route Finder</Link>
        </section>
      </div>
    </main>
  );
}