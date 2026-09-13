//frontend/src/pages/SystemArchitectureMethodology.tsx
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";

const shell = "w-full max-w-[1440px] mx-auto px-layout-margin-mobile md:px-layout-margin-tablet lg:px-layout-margin-desktop";

const stages = [
  { n: "01", tag: "OpenRouteService", title: "Route fetch & segmentation", text: "A user's origin and destination are geocoded (Nominatim/OpenStreetMap), routed via OpenRouteService, and the resulting path is split into road segments, each with its own coordinates and a stable segment ID." },
  { n: "02", tag: "IIT Delhi + MoRTH", title: "Historical risk scoring", text: "Each segment is scored against real Telangana crash records (IIT Delhi's Mendeley crash dataset) and officially identified MoRTH black spots, weighted by proximity and by day-of-week crash patterns from the same dataset." },
  { n: "03", tag: "YOLOv8 + Mapillary", title: "Road-surface vision", text: "A YOLOv8 model trained on the RDD2022 road-damage dataset scans a live street-level photo of the segment (fetched from Mapillary where coverage exists), falling back to a labelled RDD2022 sample image when no live photo is available for that exact location." },
  { n: "04", tag: "Open-Meteo + TomTom", title: "Live weather & traffic", text: "Live rainfall, wind, and visibility (Open-Meteo) and live traffic congestion (TomTom) are pulled per segment. A segment is flagged for waterlogging risk only when it's both currently raining and near a known GHMC/HYDRAA-published waterlogging point." },
  { n: "05", tag: "Google News RSS", title: "Local news check", text: "Each segment's road/area name is checked against recent Google News results for genuine mentions of accidents, closures, or flooding — filtered so a road name must actually appear in the headline, not just a generic keyword." },
];

const fusionWeights = [
  ["Historical base score", "0–100", "Black-spot proximity + nearby crash density + day-of-week pattern"],
  ["Live weather", "+0 to +20", "Added when current rain/wind crosses a threshold"],
  ["Live traffic", "+0 to +20", "Added based on live congestion level"],
  ["Waterlogging flag", "+15", "Added only when raining near a known waterlogging point"],
  ["Vision severity", "+0 to +22", "Added based on detected road-surface damage"],
  ["News flag", "+8", "Added when a genuine, relevant local headline is found"],
];

const limits = [
  ["01", "SPARSE HISTORICAL COVERAGE", "Crash data density varies by area", "The IIT Delhi dataset has 114 Telangana records out of a national dataset — dense enough for some corridors, sparse for others. A 0 historical score on a quiet segment usually reflects data sparsity, not verified safety.", "We show the score as-is rather than inventing confidence we don't have, and note this limitation explicitly here."],
  ["02", "STREET-VIEW COVERAGE GAPS", "Mapillary doesn't cover every road", "Crowdsourced street photography is denser on major Hyderabad roads than on smaller side streets.", "When no live photo exists for a segment, the app runs vision on a labelled RDD2022 sample image instead and marks the source honestly as a fallback, never as a live match."],
  ["03", "NO LIVE ACCIDENT OR DRAINAGE SENSOR FEED", "Some signals don't exist publicly in India", "There's no public real-time accident-report API, and no public live drainage-sensor feed for Hyderabad.", "Waterlogging risk is estimated using a known static list of flood-prone points combined with live rainfall — a reasonable proxy, not a live sensor reading, and stated as such."],
  ["04", "ONE DATA POINT CAN DOMINATE A SHORT ROUTE", "Short routes may see sparse signal", "On a short city route, only one or two real black spots may fall within range, so a couple of segments can carry most of the historical signal for that trip.", "This is disclosed rather than smoothed over — the explanation text always names exactly which factors contributed to a score."],
];

export default function SystemArchitectureMethodology() {
  useEffect(() => { document.title = "System Architecture & Methodology | SafeRoute Telangana"; }, []);

  return (
    <div className="pt-20 pb-space-3xl bg-background min-h-screen">
      <div className={`${shell} pt-space-xl`}>
        <Link to="/" className="font-body-sm inline-flex items-center gap-space-xs text-on-surface-variant"><ArrowLeft size={16}/> Back to overview</Link>

        <section className="mt-space-xl">
          <span className="font-label-caps-micro uppercase text-secondary">AICW Capstone · How SafeRoute actually works</span>
          <h1 className="font-display-hero mt-space-sm">System Architecture & Methodology</h1>
          <p className="font-body-md text-on-surface-variant mt-space-md max-w-3xl">Every signal below is real and traceable to a named source — no simulated or randomly generated data drives the score you see in the app.</p>
        </section>

        <section className="mt-space-xl p-space-xl bg-surface-container-low rounded-[1.75rem]">
          <span className="font-label-caps-micro text-secondary uppercase">Five-stage pipeline</span>
          <h2 className="font-headline-lg mt-space-xs">From a typed-in route to an explainable score</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md mt-space-lg">
            {stages.map((s) => (
              <article key={s.n} className="bg-surface-container-lowest border border-surface-variant rounded-xl p-space-lg">
                <div className="flex justify-between font-label-caps-micro text-on-surface-variant">
                  <span>STAGE {s.n}</span><span>{s.tag}</span>
                </div>
                <h3 className="font-headline-sm mt-space-md">{s.title}</h3>
                <p className="font-body-sm text-on-surface-variant mt-space-sm">{s.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-space-2xl p-space-xl bg-surface-container-low rounded-[1.75rem]">
          <span className="font-label-caps-micro text-secondary uppercase">The fusion formula</span>
          <h2 className="font-headline-lg mt-space-xs">How the 0–100 score is actually built</h2>
          <p className="font-body-sm text-on-surface-variant mt-space-xs max-w-2xl">Each segment starts with a historical base score, then live signals add points on top — capped at 100. Every score shown in the app includes a plain-language list of exactly which of these fired.</p>
          <div className="mt-space-lg divide-y divide-surface-variant bg-surface-container-lowest rounded-xl border border-surface-variant">
            {fusionWeights.map((w) => (
              <div key={w[0]} className="flex flex-col sm:flex-row sm:justify-between gap-space-xs p-space-md">
                <span className="font-body-sm font-semibold">{w[0]}</span>
                <span className="font-label-code-md text-secondary">{w[1]}</span>
                <span className="font-body-sm text-on-surface-variant sm:max-w-md">{w[2]}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-space-2xl p-space-xl bg-surface-container-low rounded-[1.75rem]">
          <span className="font-label-caps-micro text-secondary uppercase">Stated honestly</span>
          <h2 className="font-headline-lg mt-space-xs">Known limitations</h2>
          <p className="font-body-sm text-on-surface-variant mt-space-xs max-w-2xl">Real-world data has real gaps. Rather than hide them, here's exactly where they are and how the system handles them.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md mt-space-lg">
            {limits.map((l) => (
              <article key={l[0]} className="bg-surface-container-lowest border border-surface-variant rounded-xl p-space-lg">
                <div className="flex justify-between font-label-caps-micro">
                  <span className="text-secondary">Limitation {l[0]}</span>
                  <span className="px-space-xs py-space-2xs rounded-full bg-surface-container-low text-on-surface-variant">{l[1]}</span>
                </div>
                <h3 className="font-headline-sm mt-space-md">{l[2]}</h3>
                <p className="font-body-sm text-on-surface-variant mt-space-sm">{l[3]}</p>
                <div className="mt-space-md p-space-sm rounded bg-surface-container-low font-body-sm">
                  <b className="text-secondary">How we handle it: </b>{l[4]}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-space-2xl p-space-xl bg-surface-container-low rounded-[1.75rem]">
          <div className="flex items-center gap-space-sm">
            <ShieldCheck className="text-secondary" size={22} />
            <h2 className="font-headline-lg">Try it yourself</h2>
          </div>
          <p className="font-body-md text-on-surface-variant mt-space-sm max-w-2xl">The clearest proof of this architecture is running it on a real route and reading the explanation on each segment.</p>
          <Link to="/route-planner" className="btn btn-primary mt-space-lg inline-flex">Open the Safe Route Finder</Link>
        </section>
      </div>
    </div>
  );
}