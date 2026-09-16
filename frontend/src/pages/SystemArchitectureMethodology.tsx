//frontend/src/pages/SystemArchitectureMethodology.tsx
import { useEffect } from "react";
import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowDown,
  Sigma,
  Layers,
  Route,
  History,
  Eye,
  CloudRain,
  Newspaper,
  ShieldCheck,
  TrendingUp,
  Target,
  ScanSearch,
  AlertTriangle,
  Server,
  Workflow,
  Database,
  Code2,
  Cpu,
  Compass,
} from "lucide-react";

const shell = "w-full max-w-[1440px] mx-auto px-layout-margin-mobile md:px-layout-margin-tablet lg:px-layout-margin-desktop";

/* ------------------------------------------------------------------ *
 * Content — every figure below is drawn from the team's own training  *
 * logs, README and dataset documentation, not invented for display.   *
 * ------------------------------------------------------------------ */

const stats: Array<[string, string, LucideIcon]> = [
  ["5", "fused signal sources per segment", Layers],
  ["114", "Telangana crash records, Mendeley/IIT Delhi", History],
  ["7,706", "training + validation + test road images", ScanSearch],
  ["0–100", "explainable score, additive not black-box", Sigma],
];

const signalNodes: Array<[string, LucideIcon, string]> = [
  ["Historical Score", History, "Black-spot + crash proximity"],
  ["Live Conditions", CloudRain, "Weather · traffic · waterlogging"],
  ["Road Vision", Eye, "YOLOv8s + Mapillary imagery"],
  ["News Signal", Newspaper, "Google News RSS, road-matched"],
];

const stages: Array<[string, LucideIcon, string, string]> = [
  ["01", Route, "Route fetch & segmentation", "The origin and destination are geocoded and routed via OpenRouteService, with road names reverse-geocoded through Nominatim/OpenStreetMap. The resulting path is split into ~500m segments, each carrying a stable segment ID."],
  ["02", History, "Historical risk scoring", "Each segment is scored against the IIT Delhi Mendeley crash dataset (2,898 national records, 114 Telangana-filtered) and MoRTH Black Spot data, weighted by proximity and by a severity formula — killed × 5 + injured × 1 — since the source data carries no direct severity column. A day-of-week modifier is then applied."],
  ["03", Eye, "Road-surface vision", "A YOLOv8s model fine-tuned on the India subset of RDD2022 scans a live street-level photo of the segment, sourced from Mapillary at a 50m radius where coverage exists. Where no live photo is available, the pipeline falls back to a labelled RDD2022 sample image and marks the source as a fallback, never as a live match."],
  ["04", CloudRain, "Live weather & traffic", "Live rainfall, wind and visibility (Open-Meteo) and live congestion (TomTom, mapped to a free-flow ratio) are pulled per segment. A waterlogging flag is only raised when both conditions hold at once: active rainfall, and proximity to a GHMC/HYDRAA-published flood-prone point."],
  ["05", Newspaper, "Local news check", "Each segment's road or area name is matched against recent Google News RSS results for genuine mentions of accidents, closures, or flooding — filtered so the road name must actually appear in the headline, not just a generic keyword hit."],
];

const fusionWeights: Array<[string, string, string, number]> = [
  ["Historical base score", "0 – 100", "Black-spot proximity + nearby crash density, weighted by severity, modulated by day-of-week", 100],
  ["Live traffic", "+0 to +20", "Added by live congestion level: low 0 · medium 5 · high 12 · severe 20", 20],
  ["Road-surface vision", "+0 to +22", "Added by detected damage severity: none 0 · minor 5 · moderate 12 · severe 22", 22],
  ["Weather & waterlogging", "+0 to +15", "Live weather modifier, plus a flat +15 only when rain and a known flood point coincide", 15],
  ["Local news signal", "+0 to +15", "Scaled by a relevance/recency score against matched local headlines", 15],
];

const formulas: Array<[string, string]> = [
  ["Crash severity (no severity field in source data)", "severity = killed × 5 + injured × 1"],
  ["Historical score (400m black-spot / 300m crash radius)", "historical_score = 0.6 × blackspot_proximity + 0.4 × crash_severity"],
  ["Final segment score (capped at 100)", "final = min(100, historical + weather + traffic + waterlogging×15 + vision + news)"],
];

const visionMetrics: Array<[string, string, string, string]> = [
  ["Overall", "0.404", "0.530", "0.374"],
  ["Alligator crack", "0.646", "0.593", "0.616"],
  ["Pothole", "0.437", "0.582", "0.385"],
  ["Other corruption", "0.468", "0.555", "0.480"],
  ["Longitudinal crack", "0.284", "0.473", "0.296"],
  ["Transverse crack", "0.187", "0.448", "0.091"],
];

const dataInventory: Array<[string, string, string]> = [
  ["telangana_crashes.csv", "114 rows", "Coordinates, weekday, killed/injured, derived severity"],
  ["black_spots.csv", "38 rows", "MoRTH-identified high-risk highway locations"],
  ["waterlogging_points.csv", "121 rows", "GHMC/HYDRAA-published static flood-prone coordinates"],
  ["best.pt", "~22.5 MB", "YOLOv8s weights, fine-tuned on RDD2022 India subset"],
];

const apiEndpoints: Array<[string, string, string]> = [
  ["POST /route-risk", "{ origin, destination }", "route_total_risk, per-segment breakdown"],
  ["POST /alternate-route", "{ origin, destination }", "Availability, risk delta, time delta"],
  ["GET /location-suggestions", "?q=", "Nominatim-derived autocomplete"],
  ["GET /reverse-geocode", "?lat=&lon=", "{ label } for a coordinate"],
  ["GET /city-news", "—", "{ headlines } for the city banner"],
];

const techStack = ["FastAPI", "React 19 + TypeScript", "Vite", "Leaflet / React-Leaflet", "OpenRouteService", "Nominatim", "TomTom Traffic API", "Open-Meteo", "YOLOv8s", "Mapillary", "Google News RSS"];

const limits: Array<[string, string, string, string]> = [
  ["Sparse historical coverage", "Crash data density varies by area", "The Mendeley dataset carries 114 Telangana records out of a national 2,898 — dense enough for some corridors, sparse for others. A 0 historical score on a quiet segment usually reflects data sparsity, not a verified absence of risk.", "The score is shown as-is rather than manufacturing false confidence, and this limitation is stated here explicitly."],
  ["Street-view coverage gaps", "Mapillary doesn't cover every road", "Crowdsourced street photography is denser on major Hyderabad corridors than on smaller side streets, so live imagery isn't guaranteed at the 50m lookup radius for every segment.", "When no live photo exists, vision inference runs on a labelled RDD2022 sample image instead — the source is always marked honestly as a fallback, never as a live match."],
  ["No live accident or drainage sensor feed", "Some signals don't exist publicly in India", "There is no public real-time accident-report API and no public live drainage-sensor feed for Hyderabad to draw on.", "Waterlogging risk is estimated from a known static list of flood-prone points combined with live rainfall — a reasonable proxy, stated as a proxy, not presented as a live sensor reading."],
  ["Class imbalance in vision training", "Transverse crack has very low validation support", "Transverse crack carried far fewer training instances than the other four damage classes, which shows up directly in its mAP50 of 0.187 versus 0.646 for alligator crack.", "augment_data.py was built to brightness-augment the transverse-crack class specifically. It raised transverse mAP50 to 0.227, but overall mAP50 regressed to 0.391 — so the original run was kept, and the tradeoff is documented rather than hidden."],
  ["Inconsistent provider error handling", "Not every external call fails the same way", "A weather-provider failure quietly returns a 0 for that segment, while a routing, geocoding, news or vision-model failure can surface as a server error instead.", "Flagged as a known gap rather than papered over; the fix is to route every provider failure through one shared fallback path before the next milestone."],
  ["No persistence layer", "Routes and segment IDs don't survive a refresh", "Segment IDs are generated fresh per request, and the active route lives only in React context — a refresh or a shared deep link can't restore it.", "Scoped intentionally out of this capstone cycle; the API is already shaped so a persistence service could sit behind it without changing the contract."],
];

function ArchitectureDiagram() {
  return (
    <div className="mt-space-lg flex flex-col items-center">
      <div className="flex items-center gap-space-sm p-space-sm px-space-md rounded-xl bg-surface/10 border border-surface/15">
        <Compass size={16} className="text-secondary-fixed-dim" />
        <span className="font-body-sm font-semibold">React / Vite UI</span>
      </div>
      <ArrowDown size={16} className="text-surface/40 my-space-xs" />
      <div className="flex items-center gap-space-sm p-space-sm px-space-md rounded-xl bg-surface/10 border border-surface/15">
        <Server size={16} className="text-secondary-fixed-dim" />
        <span className="font-body-sm font-semibold">FastAPI · POST /route-risk</span>
      </div>
      <ArrowDown size={16} className="text-surface/40 my-space-xs" />
      <div className="flex items-center gap-space-sm p-space-sm px-space-md rounded-xl bg-secondary-fixed-dim text-on-secondary-fixed-variant">
        <Workflow size={16} />
        <span className="font-body-sm font-semibold">Pipeline orchestrator</span>
      </div>

      <div className="mt-space-md mb-space-xs font-body-sm text-surface/60 flex items-center gap-space-xs">
        <Cpu size={14} className="text-secondary-fixed-dim" />
        Runs four signal streams in parallel — ThreadPoolExecutor, 8 workers
      </div>
      <ArrowDown size={16} className="text-surface/40 mb-space-sm" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-space-sm w-full">
        {signalNodes.map(([label, Icon, note]) => (
          <div key={label} className="flex flex-col items-center text-center gap-space-2xs p-space-md rounded-xl bg-surface/10 border border-surface/15">
            <Icon size={18} className="text-secondary-fixed-dim" />
            <span className="font-body-sm font-semibold">{label}</span>
            <span className="font-body-sm text-surface/60 leading-snug">{note}</span>
          </div>
        ))}
      </div>

      <ArrowDown size={16} className="text-surface/40 my-space-sm" />
      <div className="flex items-center gap-space-sm p-space-sm px-space-md rounded-xl bg-secondary-fixed-dim text-on-secondary-fixed-variant">
        <Sigma size={16} />
        <span className="font-body-sm font-semibold">Additive fusion engine</span>
      </div>
      <ArrowDown size={16} className="text-surface/40 my-space-xs" />
      <div className="flex items-center gap-space-sm p-space-sm px-space-md rounded-xl bg-surface/10 border border-surface/15">
        <ShieldCheck size={16} className="text-secondary-fixed-dim" />
        <span className="font-body-sm font-semibold">Explainable 0–100 score, back to the UI</span>
      </div>
    </div>
  );
}

export default function SystemArchitectureMethodology() {
  useEffect(() => { document.title = "System Architecture & Methodology | SafeRoute Telangana"; }, []);

  return (
    <div className="pt-20 pb-space-3xl bg-background min-h-screen">
      <div className={`${shell} pt-space-xl`}>
        <Link to="/" className="font-body-sm inline-flex items-center gap-space-xs text-on-surface-variant hover:text-on-surface transition-colors">
          <ArrowLeft size={16}/> Back to overview
        </Link>
      </div>

      {/* ---------- Hero (full-bleed dark) ---------- */}
      <section className="w-full bg-on-surface text-surface mt-space-lg">
        <div className={`${shell} py-space-2xl`}>
          <span className="inline-flex rounded-full px-space-md py-space-2xs bg-secondary-fixed-dim text-on-secondary-fixed-variant font-label-caps-micro uppercase">
            AICW Capstone · Supported by Microsoft
          </span>
          <h1 className="font-display-hero mt-space-md max-w-4xl">System Architecture &amp; Methodology</h1>
          <p className="font-body-lg text-surface/70 mt-space-md max-w-3xl">
            SafeRoute Telangana fuses five independently-sourced signals into a single explainable risk score per road segment. Every number below traces back to a named source — no signal in this pipeline is randomly generated, and every known gap is documented rather than smoothed over.
          </p>

          <div className="mt-space-lg p-space-md rounded-xl bg-surface/10 border border-surface/15 flex items-start gap-space-sm max-w-3xl">
            <Target size={18} className="text-secondary-fixed-dim shrink-0 mt-[3px]" />
            <p className="font-body-sm text-surface/80">
              SafeRoute is a decision-support layer, not a collision-prediction service or emergency guidance. It exposes safety-relevant evidence and the uncertainty behind it so a driver can compare route trade-offs — the same honesty that shapes the limitations section below.
            </p>
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
        </div>
      </section>

      <div className={`${shell}`}>
        {/* ---------- Architecture diagram (full-bleed dark, below) ---------- */}
      </div>
      <section className="w-full bg-on-surface text-surface mt-0">
        <div className={`${shell} py-space-2xl`}>
          <div className="flex items-center gap-space-sm">
            <Workflow className="text-secondary-fixed-dim" size={22} />
            <span className="font-label-caps-micro text-secondary-fixed-dim uppercase">Request lifecycle</span>
          </div>
          <h2 className="font-headline-lg mt-space-xs">What happens between typing a route and seeing a score</h2>
          <p className="font-body-sm text-surface/60 mt-space-xs max-w-2xl">
            A single request fans out across four independent signal sources and converges back into one explainable number — no step is hidden inside a model that can't be inspected.
          </p>
          <ArchitectureDiagram />
        </div>
      </section>

      <div className={`${shell}`}>
        {/* ---------- Pipeline ---------- */}
        <section className="mt-space-2xl">
          <span className="font-label-caps-micro text-secondary uppercase">Five-stage pipeline</span>
          <h2 className="font-headline-lg mt-space-xs">From a typed-in route to an explainable score</h2>
          <p className="font-body-sm text-on-surface-variant mt-space-xs max-w-2xl">Each stage below runs in sequence for every segment on a route, and hands its output forward to the fusion engine.</p>

          <div className="relative mt-space-xl">
            <div className="hidden lg:block absolute top-[26px] left-0 right-0 h-px bg-outline-variant" aria-hidden="true" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-space-md">
              {stages.map(([n, Icon, title, text]) => (
                <article key={n} className="relative bg-surface-container-lowest border border-surface-variant rounded-xl p-space-lg shadow-sm">
                  <div className="w-[52px] h-[52px] rounded-full bg-on-surface text-surface flex items-center justify-center relative z-10">
                    <Icon size={22} />
                  </div>
                  <div className="flex items-baseline gap-space-xs mt-space-md">
                    <span className="font-label-code-md text-secondary">{n}</span>
                    <h3 className="font-headline-sm">{title}</h3>
                  </div>
                  <p className="font-body-sm text-on-surface-variant mt-space-sm leading-relaxed">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Fusion formula ---------- */}
        <section className="mt-space-2xl p-space-xl bg-surface-container-low rounded-[1.75rem]">
          <div className="flex items-center gap-space-sm">
            <Sigma className="text-secondary" size={22} />
            <span className="font-label-caps-micro text-secondary uppercase">The fusion formula</span>
          </div>
          <h2 className="font-headline-lg mt-space-xs">How the 0–100 score is actually built</h2>
          <p className="font-body-sm text-on-surface-variant mt-space-xs max-w-2xl">
            Every segment starts from a historical base score, then each live signal adds a bounded number of points on top — capped at 100. Because the model is additive rather than statistical, every score can be taken apart again into the exact signals that produced it.
          </p>

          <div className="mt-space-lg flex flex-col gap-space-sm">
            {fusionWeights.map(([label, range, note, weight]) => (
              <div key={label} className="p-space-md rounded-xl bg-surface-container-lowest border border-surface-variant">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-space-xs">
                  <span className="font-body-md font-semibold">{label}</span>
                  <span className="font-label-code-md text-secondary shrink-0">{range}</span>
                </div>
                <div className="h-2 bg-surface-container rounded-full mt-space-sm overflow-hidden">
                  <div className="h-full rounded-full bg-secondary-container" style={{ width: `${weight}%` }} />
                </div>
                <p className="font-body-sm text-on-surface-variant mt-space-xs">{note}</p>
              </div>
            ))}
          </div>

          <div className="mt-space-lg grid grid-cols-1 md:grid-cols-3 gap-space-sm">
            {formulas.map(([label, code]) => (
              <div key={code} className="p-space-md rounded-xl bg-on-surface text-surface">
                <span className="font-body-sm text-surface/60">{label}</span>
                <div className="font-label-code-md text-secondary-fixed-dim mt-space-sm break-words">{code}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ---------- Vision model performance ---------- */}
        <section className="mt-space-2xl">
          <div className="flex items-center gap-space-sm">
            <Target className="text-secondary" size={22} />
            <span className="font-label-caps-micro text-secondary uppercase">Model performance, not a claim</span>
          </div>
          <h2 className="font-headline-lg mt-space-xs">YOLOv8 road-damage detection, measured</h2>
          <p className="font-body-sm text-on-surface-variant mt-space-xs max-w-2xl">
            Fine-tuned for 50 epochs at 640px, batch size 16, on the India subset of RDD2022 — 5,368 training images, 1,172 validation, 1,166 held-out test. Metrics below are on the validation set, per damage class, not a single blended number.
          </p>

          <div className="mt-space-lg overflow-x-auto rounded-xl border border-surface-variant">
            <table className="w-full text-left border-collapse min-w-[560px]">
              <thead>
                <tr className="bg-on-surface text-surface">
                  <th className="font-label-caps-micro uppercase p-space-md">Class</th>
                  <th className="font-label-caps-micro uppercase p-space-md">mAP50</th>
                  <th className="font-label-caps-micro uppercase p-space-md">Precision</th>
                  <th className="font-label-caps-micro uppercase p-space-md">Recall</th>
                </tr>
              </thead>
              <tbody className="bg-surface-container-lowest">
                {visionMetrics.map(([cls, map50, precision, recall], i) => (
                  <tr key={cls} className={i === 0 ? "bg-surface-container-low" : "border-t border-surface-variant"}>
                    <td className="font-body-sm p-space-md font-semibold">{cls}</td>
                    <td className="font-label-code-md p-space-md text-secondary">{map50}</td>
                    <td className="font-label-code-md p-space-md">{precision}</td>
                    <td className="font-label-code-md p-space-md">{recall}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="font-body-sm text-on-surface-variant mt-space-sm max-w-2xl flex items-start gap-space-xs">
            <TrendingUp size={16} className="text-secondary shrink-0 mt-[3px]" />
            A confidence-threshold sweep (0.1–0.6) was run against the validation set to characterise the precision/recall tradeoff, rather than reporting a single cherry-picked number — see the class-imbalance limitation below for what a later augmentation experiment revealed.
          </p>
        </section>

        {/* ---------- Data & API surface ---------- */}
        <section className="mt-space-2xl grid grid-cols-1 lg:grid-cols-2 gap-space-lg">
          <div>
            <div className="flex items-center gap-space-sm">
              <Database className="text-secondary" size={22} />
              <span className="font-label-caps-micro text-secondary uppercase">What the model runs on</span>
            </div>
            <h2 className="font-headline-lg mt-space-xs">Data inventory</h2>
            <div className="mt-space-md flex flex-col gap-space-xs">
              {dataInventory.map(([file, size, note]) => (
                <div key={file} className="p-space-md rounded-xl bg-surface-container-lowest border border-surface-variant">
                  <div className="flex flex-wrap justify-between gap-space-xs">
                    <span className="font-label-code-md">{file}</span>
                    <span className="font-body-sm text-secondary">{size}</span>
                  </div>
                  <p className="font-body-sm text-on-surface-variant mt-space-xs">{note}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-space-sm">
              <Code2 className="text-secondary" size={22} />
              <span className="font-label-caps-micro text-secondary uppercase">Backend surface</span>
            </div>
            <h2 className="font-headline-lg mt-space-xs">API endpoints</h2>
            <div className="mt-space-md flex flex-col gap-space-xs">
              {apiEndpoints.map(([endpoint, req, res]) => (
                <div key={endpoint} className="p-space-md rounded-xl bg-on-surface text-surface">
                  <span className="font-label-code-md text-secondary-fixed-dim">{endpoint}</span>
                  <p className="font-body-sm text-surface/60 mt-space-xs">{req} → {res}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Tech stack ---------- */}
        <section className="mt-space-2xl">
          <span className="font-label-caps-micro text-secondary uppercase">Built with</span>
          <h2 className="font-headline-lg mt-space-xs">The real stack behind the score</h2>
          <div className="mt-space-md flex flex-wrap gap-space-xs">
            {techStack.map((t) => (
              <span key={t} className="px-space-md py-space-2xs font-label-caps-micro uppercase bg-secondary-container text-on-secondary-container rounded-full">{t}</span>
            ))}
          </div>
        </section>

        {/* ---------- Limitations ---------- */}
        <section className="mt-space-2xl p-space-xl bg-surface-container-low rounded-[1.75rem]">
          <div className="flex items-center gap-space-sm">
            <AlertTriangle className="text-secondary" size={22} />
            <span className="font-label-caps-micro text-secondary uppercase">Stated honestly</span>
          </div>
          <h2 className="font-headline-lg mt-space-xs">Known limitations</h2>
          <p className="font-body-sm text-on-surface-variant mt-space-xs max-w-2xl">Real-world data has real gaps. Rather than hide them, here is exactly where they are and how the system handles them.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md mt-space-lg">
            {limits.map((l, i) => (
              <article key={l[0]} className="bg-surface-container-lowest border border-surface-variant rounded-xl p-space-lg">
                <div className="flex justify-between font-label-caps-micro">
                  <span className="text-secondary">Limitation {String(i + 1).padStart(2, "0")}</span>
                  <span className="px-space-xs py-space-2xs rounded-full bg-surface-container text-on-surface-variant">{l[1]}</span>
                </div>
                <h3 className="font-headline-sm mt-space-md">{l[0]}</h3>
                <p className="font-body-sm text-on-surface-variant mt-space-sm">{l[2]}</p>
                <div className="mt-space-md p-space-sm rounded bg-on-surface text-surface font-body-sm">
                  <b className="text-secondary-fixed-dim">How we handle it: </b>{l[3]}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      {/* ---------- CTA (full-bleed dark) ---------- */}
      <section className="w-full bg-on-surface text-surface mt-space-2xl">
        <div className={`${shell} py-space-2xl text-center`}>
          <div className="flex justify-center">
            <ShieldCheck className="text-secondary-fixed-dim" size={28} />
          </div>
          <h2 className="font-headline-lg mt-space-sm">Try it yourself</h2>
          <p className="font-body-md text-surface/70 mt-space-sm max-w-2xl mx-auto">The clearest proof of this architecture is running it on a real route and reading the explanation behind each segment's score.</p>
          <Link to="/route-planner" className="mt-space-lg inline-flex items-center gap-space-xs rounded-full px-space-lg py-space-sm bg-secondary-fixed-dim text-on-secondary-fixed-variant font-body-md font-semibold">
            Open the Safe Route Finder <ArrowRight size={16} />
          </Link>
        </div>
      </section>
      <div className="pb-space-2xl" />
    </div>
  );
}