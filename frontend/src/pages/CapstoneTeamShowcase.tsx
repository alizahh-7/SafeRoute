//frontend/src/pages/CapstoneTeamShowcase.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  Download,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  GitBranch,
  Award,
  Users,
  Database,
  Route,
  CloudRain,
  Eye,
  Newspaper,
  ClipboardCheck,
  Sparkles,
  GraduationCap,
  Layers3,
} from "lucide-react";
import { ASSETS } from "../assets.config";

const shell = "w-full max-w-[1440px] mx-auto px-layout-margin-mobile md:px-layout-margin-tablet lg:px-layout-margin-desktop";

const REPO_URL = "https://github.com/alizahh-7/SafeRoute";

const people: Array<[string, string, string, string, string, string]> = [
  ["Umaima", ASSETS.team.umaima, "Team Lead & Core Risk Engine", "https://github.com/umaima06", "Owns route intake and segmentation, historical risk scoring, the day-of-week pattern modifier, and the additive fusion engine that combines every live signal into one explainable score — plus overall backend integration.", "Team Lead · Backend"],
  ["Alizah", ASSETS.team.alizah, "Live Conditions & Routing Intelligence", "https://github.com/alizahh-7", "Built the Open-Meteo weather overlay, TomTom traffic scoring, and the waterlogging-fusion logic that only flags flooding when rain and a known flood point coincide — plus the safer alternate-route comparison.", "Live Signals Lead"],
  ["Zunairah", ASSETS.team.zunairah, "Computer Vision, News Intelligence & Frontend", "https://github.com/Zunairah-k", "Trained and documented the YOLOv8 road-damage model on RDD2022, built the Mapillary multi-point lookup with fallback handling, the Google News RSS relevance/urgency filtering, and this web application.", "Full-Stack & Vision Lead"],
  ["Shazia", ASSETS.team.shazia, "Data Curation, QA & Documentation", "https://github.com/shaziaiqbal9667", "Curated and cleaned the black-spot and waterlogging datasets, ran end-to-end testing across real Hyderabad routes, and compiled the project report, presentation and demo video.", "Data & QA Lead"],
];

const stats: Array<[string, string, LucideIcon]> = [
  ["4", "engineers, four ownership areas", Users],
  ["7", "real data sources fused, zero simulated", Database],
  ["10", "application pages, one connected demo", Layers3],
  ["1", "explainable score per road segment", Sparkles],
];

const techStack = ["FastAPI", "React 19 + TypeScript", "Vite", "Leaflet / React-Leaflet", "OpenRouteService", "Nominatim", "TomTom Traffic API", "Open-Meteo", "YOLOv8s", "Mapillary", "Google News RSS"];

const dataSources: Array<[string, string, string, LucideIcon]> = [
  ["Historical crashes", "IIT Delhi · Mendeley Data", "114 Telangana-filtered rows, media-reported road traffic crash data", Database],
  ["Known black spots", "MoRTH Black Spot MIS", "38 officially identified high-risk highway locations", Award],
  ["Live weather", "Open-Meteo", "Rain, wind, and visibility per segment coordinate", CloudRain],
  ["Live traffic", "TomTom Traffic API", "Real-time congestion by location", Route],
  ["Waterlogging zones", "GHMC / HYDRAA published lists", "121 static coordinates, cross-referenced with live rainfall", CloudRain],
  ["Road-surface vision", "YOLOv8 · RDD2022 · Mapillary", "Live street imagery, with a labelled sample-image fallback", Eye],
  ["Live local news", "Google News RSS", "Recent, road-name-matched reports for each segment", Newspaper],
];

const journey: Array<[string, string]> = [
  ["Problem framing", "Mainstream navigation apps optimize for time and distance only. Telangana's own Black Spot data exists but sits disconnected from any commuter's actual route — so the team set out to fuse it directly into routing, under Mayuri Ma'am's mentorship."],
  ["Data & model build", "Crash records, black spots, and waterlogging points were curated and cleaned; a YOLOv8 model was trained on India-specific road-damage imagery; live weather, traffic, and news pipelines were built in-house against real APIs."],
  ["Fusion & integration", "All five signal streams were combined into one additive, explainable 0–100 score per segment, wired end-to-end from a typed-in route through to a plain-language risk explanation."],
  ["Documentation & QA", "Every real limitation — sparse crash coverage, patchy street imagery, no live drainage sensors — was tested against real Hyderabad corridors and written up rather than hidden."],
];

export default function CapstoneTeamShowcase() {
  const [file, setFile] = useState(false);

  useEffect(() => { document.title = "Team & Real Data Sources | SafeRoute Telangana"; }, []);

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
        <Link to="/" className="font-body-sm inline-flex items-center gap-space-xs text-on-surface-variant hover:text-on-surface transition-colors">
          <ArrowLeft size={16}/> Back to overview
        </Link>
      </div>

      {/* ---------- Hero (full-bleed dark) ---------- */}
      <section className="w-full bg-on-surface text-surface mt-space-lg">
        <div className={`${shell} py-space-2xl`}>
          <span className="inline-flex rounded-full px-space-md py-space-2xs bg-secondary-fixed-dim text-on-secondary-fixed-variant font-label-caps-micro uppercase">
            AI Careers for Women (AICW) · Capstone, supported by Microsoft
          </span>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg mt-space-sm">
            <div className="lg:col-span-8">
              <h1 className="font-display-hero">SafeRoute Telangana — Team &amp; Real Data Sources</h1>
              <p className="font-body-lg text-surface/70 mt-space-md max-w-3xl">
                Built by a team of four for the AICW capstone program — a road-safety layer that fuses real historical crash data, live weather and traffic, road-surface vision, and local news into one explainable risk score per route segment.
              </p>
              <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="mt-space-md font-body-sm inline-flex items-center gap-space-2xs text-secondary-fixed-dim hover:underline">
                <ExternalLink size={15} /> View the source on GitHub <ExternalLink size={12} />
              </a>
            </div>
            <div className="lg:col-span-4 p-space-lg rounded-[1.75rem] bg-surface text-on-surface flex flex-col justify-between">
              <div>
                <span className="font-label-caps-micro uppercase text-on-surface-variant">Project status</span>
                <b className="block text-2xl mt-space-xs">Submission ready</b>
              </div>
              <span className="font-body-sm text-on-surface-variant mt-space-md">Backend and frontend fully wired to real data — every known limitation documented, not hidden.</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-space-sm mt-space-xl">
            {stats.map(([value, label, Icon]) => (
              <div key={label} className="p-space-md rounded-[1.25rem] bg-surface/10 border border-surface/15">
                <Icon size={18} className="text-secondary-fixed-dim" />
                <div className="font-headline-md mt-space-sm">{value}</div>
                <div className="font-body-sm text-surface/60 mt-space-2xs leading-snug">{label}</div>
              </div>
            ))}
          </div>

          <div className="mt-space-lg p-space-md rounded-xl bg-surface/10 border border-surface/15 flex flex-wrap gap-space-sm items-center">
            <span className="font-body-sm mr-auto text-surface/80">Download the team roster and real data-source attribution</span>
            <button onClick={download} className="rounded-full px-space-md py-space-2xs bg-secondary-fixed-dim text-on-secondary-fixed-variant font-body-sm font-semibold inline-flex items-center gap-space-2xs">
              <Download size={15}/>{file ? "Downloaded" : "Download summary"}
            </button>
          </div>
        </div>
      </section>

      <div className={`${shell}`}>
        {/* ---------- Team ---------- */}
        <section className="mt-space-2xl">
          <span className="font-label-caps-micro text-secondary uppercase">The team</span>
          <h2 className="font-headline-lg mt-space-xs">Four engineers, four ownership areas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md mt-space-lg">
            {people.map((p) => (
              <article key={p[0]} className="rounded-[1.75rem] overflow-hidden bg-surface-container-lowest border border-surface-variant flex flex-col">
                <div className="h-1 bg-secondary-container" />
                <div className="h-56 relative bg-surface-container overflow-hidden">
                  <img src={p[1]} alt={`${p[0]} avatar`} className="w-full h-full object-cover object-top scale-95" />
                </div>
                <div className="p-space-md flex flex-col flex-1">
                  <h3 className="font-headline-sm">{p[0]}</h3>
                  <span className="inline-flex mt-space-2xs px-space-xs py-space-2xs rounded-full bg-secondary-container text-on-secondary-container font-label-caps-micro uppercase w-fit">{p[5]}</span>
                  <span className="font-body-sm mt-space-sm">{p[2]}</span>
                  <p className="font-body-sm text-on-surface-variant mt-space-xs flex-1">{p[4]}</p>
                  <a href={p[3]} target="_blank" rel="noopener noreferrer" className="mt-space-md font-body-sm inline-flex items-center gap-space-2xs text-secondary hover:underline">
                    <GitBranch size={14} /> GitHub <ExternalLink size={12} />
                  </a>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-space-md p-space-md rounded-xl bg-surface-container-low border border-surface-variant flex items-center gap-space-sm">
            <GraduationCap size={18} className="text-secondary shrink-0" />
            <span className="font-body-sm text-on-surface-variant">Mentored by <b className="text-on-surface">Mayuri Ma'am</b> throughout the AICW capstone cycle.</span>
          </div>
        </section>

        {/* ---------- Tech stack ---------- */}
        <section className="mt-space-2xl">
          <span className="font-label-caps-micro text-secondary uppercase">Engineered with</span>
          <h2 className="font-headline-lg mt-space-xs">The real stack behind the app</h2>
          <div className="mt-space-md flex flex-wrap gap-space-xs">
            {techStack.map((t) => (
              <span key={t} className="px-space-md py-space-2xs font-label-caps-micro uppercase bg-secondary-container text-on-secondary-container rounded-full">{t}</span>
            ))}
          </div>
        </section>
      </div>

      {/* ---------- Data sources (full-bleed dark) ---------- */}
      <section className="w-full bg-on-surface text-surface mt-space-2xl">
        <div className={`${shell} py-space-2xl`}>
          <div className="flex items-center gap-space-sm">
            <Database className="text-secondary-fixed-dim" size={22} />
            <span className="font-label-caps-micro text-secondary-fixed-dim uppercase">Real data, not simulated</span>
          </div>
          <h2 className="font-headline-lg mt-space-xs">Every signal traces back to a real source</h2>
          <p className="font-body-sm text-surface/60 mt-space-xs max-w-2xl">No signal in this app is randomly generated. Where real-time coverage is unavailable, the app says so rather than fabricating a result — see the Methodology page for the stated limitations behind each one.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-sm mt-space-lg">
            {dataSources.map(([name, source, note, Icon]) => (
              <div key={name} className="p-space-md rounded-xl bg-surface/10 border border-surface/15 flex gap-space-sm">
                <Icon size={18} className="text-secondary-fixed-dim shrink-0 mt-[2px]" />
                <div>
                  <div className="flex flex-wrap justify-between gap-space-xs">
                    <b className="font-body-sm">{name}</b>
                    <span className="font-label-caps-micro text-secondary-fixed-dim uppercase">{source}</span>
                  </div>
                  <p className="font-body-sm text-surface/60 mt-space-xs">{note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className={`${shell}`}>
        {/* ---------- Journey ---------- */}
        <section className="mt-space-2xl">
          <div className="flex items-center gap-space-sm">
            <ClipboardCheck className="text-secondary" size={22} />
            <span className="font-label-caps-micro text-secondary uppercase">How it came together</span>
          </div>
          <h2 className="font-headline-lg mt-space-xs">From problem to a working pipeline</h2>
          <div className="relative mt-space-lg">
            <div className="hidden md:block absolute top-0 bottom-0 left-[15px] w-px bg-outline-variant" aria-hidden="true" />
            <div className="flex flex-col gap-space-lg">
              {journey.map(([title, text], i) => (
                <div key={title} className="relative md:pl-space-2xl flex gap-space-md md:block">
                  <div className="hidden md:flex absolute left-0 top-0 w-[32px] h-[32px] rounded-full bg-on-surface text-surface items-center justify-center font-label-code-md">
                    {i + 1}
                  </div>
                  <div className="md:hidden shrink-0 w-[28px] h-[28px] rounded-full bg-on-surface text-surface flex items-center justify-center font-label-code-md">{i + 1}</div>
                  <div>
                    <h3 className="font-headline-sm">{title}</h3>
                    <p className="font-body-sm text-on-surface-variant mt-space-xs max-w-2xl">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ---------- CTA (full-bleed dark) ---------- */}
      <section className="w-full bg-on-surface text-surface mt-space-2xl">
        <div className={`${shell} py-space-2xl text-center`}>
          <h2 className="font-headline-lg">See it work on a real route</h2>
          <p className="font-body-md text-surface/70 mt-space-sm max-w-xl mx-auto">The best demonstration of this project is trying it — enter a real Hyderabad route and see the actual computed risk score.</p>
          <Link to="/route-planner" className="mt-space-lg inline-flex items-center gap-space-xs rounded-full px-space-lg py-space-sm bg-secondary-fixed-dim text-on-secondary-fixed-variant font-body-md font-semibold">
            Try the Safe Route Finder <ArrowRight size={16} />
          </Link>
        </div>
      </section>
      <div className="pb-space-2xl" />
    </main>
  );
}