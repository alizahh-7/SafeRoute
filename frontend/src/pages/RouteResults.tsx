//frontend/src/pages/RouteResults.tsx

import { Navigation, ShieldCheck, AlertTriangle, Zap, Download, Eye, CloudSun, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useRouteContext } from "../context/RouteContext";

const riskLabel = (score: number) => score >= 75 ? "SEVERE RISK" : score >= 50 ? "HIGH RISK" : score >= 30 ? "MODERATE RISK" : "MINIMAL RISK";
const riskColor = (score: number) => score >= 75 ? "#B93535" : score >= 50 ? "#D36128" : score >= 30 ? "#D99B26" : "#2E7D5B";

const RouteResults = () => {
  const { routeData, alternateData, origin, destination, loading, error } = useRouteContext();

  if (loading) return <div className="pt-32 text-center font-body-lg">Analyzing your route with real data...</div>;
  if (error) return <div className="pt-32 text-center font-body-lg text-error">{error}</div>;
  if (!routeData) return <div className="pt-32 text-center font-body-lg">No route yet — go back and plan one.</div>;

  const { route_total_risk, segments } = routeData;
  const primaryColor = riskColor(route_total_risk);
  const hazardCount = segments.filter(s => s.waterlogging_flag || s.news_flags?.length || s.vision_severity !== "none").length;
  const worstSegment = segments.reduce((worst, s) => !worst || s.final_score > worst.final_score ? s : worst, segments[0]);
  const shownSegments = segments.slice(0, 5);

  const showAlternate = alternateData?.alternate_available && alternateData.should_suggest_alternate;

  return (
    <div className="w-full pt-20 bg-background min-h-screen pb-space-3xl">
      <div className="max-w-[1440px] mx-auto px-layout-margin-mobile md:px-layout-margin-tablet lg:px-layout-margin-desktop pt-space-xl">

        {/* Header Section */}
        <div className="flex justify-between items-end flex-wrap gap-space-md mb-space-xl">
          <div className="flex flex-col gap-space-xs">
            <div className="flex gap-space-xs items-center mb-space-2xs">
              <span className="font-label-caps-micro text-label-caps-micro uppercase text-secondary font-bold tracking-widest bg-secondary-container/20 px-space-sm py-space-2xs rounded-full">MULTI-CRITERIA AI PATHFINDING</span>
              <span className="font-label-code-md text-label-code-md text-on-surface-variant flex items-center gap-space-2xs font-semibold"><span className="w-2 h-2 rounded-full bg-[#2E7D5B] animate-pulse"></span> Live Model Synthesis Active</span>
            </div>
            <h1 className="font-display-hero text-display-hero text-on-surface tracking-tight font-medium max-w-2xl leading-tight">{origin} → {destination}</h1>
          </div>

          <div className="flex flex-col gap-space-sm">
            <div className="flex bg-surface-container-low border border-surface-variant rounded-full p-1 font-label-code-md text-label-code-md text-on-surface-variant shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
              <div className="py-space-xs px-space-md bg-on-surface text-surface rounded-full flex items-center gap-space-2xs font-semibold shadow-sm"><ShieldCheck size={16}/> Viewing SafeRoute (Recommended)</div>
            </div>
            <div className="flex gap-space-sm justify-end flex-wrap">
              <Link to={`/segment/${worstSegment.segment_id}`} className="bg-[#F9EAEA] text-[#B93535] border border-[#B93535]/20 px-space-md py-space-xs rounded-full font-body-sm">Review highest-risk segment</Link>
              <button className="bg-secondary-container text-on-secondary-container font-headline-sm text-headline-sm px-space-lg py-space-xs rounded-full flex items-center gap-space-2xs shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"><Navigation size={18} className="rotate-45" /> Start Safe Turn-by-Turn</button>
              <button className="bg-surface-container-lowest text-on-surface border border-surface-variant px-space-md py-space-xs rounded-full shadow-sm hover:bg-surface-container transition-colors"><Download size={18}/></button>
            </div>
          </div>
        </div>

        {/* Route Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md mb-space-xl">
          <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border-2" style={{ borderColor: primaryColor }}>
            <div className="flex justify-between items-start mb-space-md">
              <div className="flex flex-col gap-space-xs">
                <div className="flex items-center gap-space-xs font-headline-md text-headline-md text-on-surface">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: primaryColor }}></span> Your Route
                  <span className="font-label-caps-micro text-label-caps-micro font-bold uppercase px-space-xs py-space-2xs rounded-full ml-space-xs" style={{ color: primaryColor, backgroundColor: `${primaryColor}1A`, border: `1px solid ${primaryColor}4D` }}>{route_total_risk}/100 {riskLabel(route_total_risk)}</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm">{segments.length} segments analyzed · real Telangana crash data, live weather, live traffic, and street-level vision scanning.</p>
              </div>
              <div className="text-right">
                <div className="font-display-hero text-display-hero font-semibold leading-none" style={{ color: primaryColor }}>{route_total_risk}</div>
                <div className="font-label-caps-micro text-label-caps-micro font-bold text-on-surface-variant uppercase mt-space-2xs">COMPOSITE RISK</div>
              </div>
            </div>

            <div className="flex gap-space-sm mb-space-md">
              <div className="bg-surface-container-low border border-surface-variant rounded-lg py-space-xs px-space-md text-center flex-1">
                <div className="font-label-caps-micro text-label-caps-micro font-bold text-on-surface-variant uppercase">SEGMENTS</div>
                <div className="font-label-code-md text-label-code-md font-semibold text-on-surface">{segments.length}</div>
              </div>
              <div className="bg-surface-container-low border border-surface-variant rounded-lg py-space-xs px-space-md text-center flex-1">
                <div className="font-label-caps-micro text-label-caps-micro font-bold text-on-surface-variant uppercase">HAZARD SIGNALS</div>
                <div className="font-label-code-md text-label-code-md font-semibold text-on-surface">{hazardCount}</div>
              </div>
              <div className="bg-[#EBF4EF] border border-[#2E7D5B]/30 rounded-lg py-space-xs px-space-md text-center flex-1">
                <div className="font-label-caps-micro text-label-caps-micro font-bold text-[#2E7D5B] uppercase">HIGHEST RISK</div>
                <div className="font-label-code-md text-label-code-md font-semibold text-[#2E7D5B]">{worstSegment.final_score}/100</div>
              </div>
            </div>

            <div className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-space-2xs">
              <CheckCircle size={16} className="text-[#2E7D5B]" /> {worstSegment.road_name}: {worstSegment.explanation}
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border-2 border-transparent opacity-90">
            {showAlternate ? (
              <>
                <div className="flex justify-between items-start mb-space-md">
                  <div className="flex flex-col gap-space-xs">
                    <div className="flex items-center gap-space-xs font-headline-md text-headline-md text-on-surface"><ShieldCheck size={18} className="text-secondary"/> Safer Alternate Available</div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm">SafeRoute found a genuinely lower-risk path, costing {alternateData?.extra_time_minutes} extra minute(s).</p>
                  </div>
                  <div className="text-right">
                    <div className="font-display-hero text-display-hero text-[#2E7D5B] font-semibold leading-none">{alternateData?.alternate_risk}</div>
                    <div className="font-label-caps-micro text-label-caps-micro font-bold text-[#2E7D5B] uppercase mt-space-2xs">ALTERNATE RISK</div>
                  </div>
                </div>
                <div className="font-body-sm text-body-sm text-[#2E7D5B] flex items-center gap-space-2xs">
                  <CheckCircle size={16} /> {Math.round(((alternateData!.primary_risk! - alternateData!.alternate_risk!) / alternateData!.primary_risk!) * 100)}% lower risk than your current route
                </div>
              </>
            ) : (
              <div className="text-on-surface-variant font-body-sm">
                <AlertTriangle size={16} className="inline mr-space-2xs" />
                {alternateData?.alternate_available === false ? "No alternate route was available to compare for this trip." : "No meaningfully safer alternate found — your current route is already close to optimal."}
              </div>
            )}
          </div>
        </div>

        {/* Map and Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">

          {/* Map Area (still a visual placeholder — real map rendering is a separate task) */}
          <div className="lg:col-span-8 flex flex-col gap-space-md">
            <div className="bg-surface-container-lowest rounded-xl p-space-lg relative flex-1 min-h-[500px] shadow-sm border border-surface-variant flex items-center justify-center text-center">
              <div>
                <MapIconPlaceholder />
                <p className="font-body-md text-on-surface-variant mt-space-md max-w-md mx-auto">Map rendering isn't wired up yet — route data itself is real. See the segment list for actual scored results.</p>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-space-md rounded-xl flex justify-between items-center border border-surface-variant shadow-sm flex-wrap gap-space-sm">
              <div className="flex items-center gap-space-md">
                <div className="w-10 h-10 shrink-0 rounded-full bg-secondary-container/20 flex items-center justify-center text-secondary border border-secondary/30">
                  <Zap size={20} />
                </div>
                <div className="flex flex-col gap-space-2xs">
                  <div className="font-headline-sm text-headline-sm font-semibold">Deep Safety Synthesis Active</div>
                  <div className="font-body-sm text-body-sm text-on-surface-variant max-w-lg">Real historical crash data, live weather, live traffic, waterlogging fusion, YOLOv8 vision scanning, and local news checks — fused into one score per segment.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 flex flex-col gap-space-md">
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-surface-variant flex flex-col flex-1">
              <div className="flex justify-between items-center mb-space-xl">
                <div className="font-headline-sm text-headline-sm flex items-center gap-space-xs"><Navigation size={18} className="text-secondary"/> Route Segments</div>
                <div className="font-label-caps-micro text-label-caps-micro font-bold text-on-surface-variant uppercase">{segments.length} TOTAL</div>
              </div>

              <div className="bg-surface-container-low border border-surface-variant rounded-xl p-space-md mb-space-xl">
                <div className="flex justify-between font-label-caps-micro text-label-caps-micro font-bold mb-space-xs uppercase">
                  <span className="text-on-surface-variant">TOTAL SAFEROUTE SCORE</span>
                  <span style={{ color: primaryColor }}>{route_total_risk} / 100</span>
                </div>
                <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden">
                  <div className="h-full" style={{ width: `${route_total_risk}%`, backgroundColor: primaryColor }}></div>
                </div>
              </div>

              <div className="flex flex-col gap-space-md relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-surface-variant">
                {shownSegments.map((seg) => (
                  <div key={seg.segment_id} className="relative pl-10">
                    <div className="absolute left-0 top-1 w-6 h-6 bg-surface-container-lowest border border-surface-variant rounded-full flex items-center justify-center z-10 shadow-sm">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: riskColor(seg.final_score) }}></div>
                    </div>
                    <div className="rounded-xl p-space-md transition-transform hover:-translate-y-0.5 shadow-sm border" style={{ backgroundColor: `${riskColor(seg.final_score)}0D`, borderColor: `${riskColor(seg.final_score)}4D` }}>
                      <div className="flex justify-between items-start mb-space-sm gap-space-xs">
                        <div className="flex flex-col gap-space-2xs">
                          <div className="font-headline-sm text-headline-sm leading-tight">{seg.road_name}</div>
                          <div className="font-label-caps-micro text-label-caps-micro font-bold text-on-surface-variant uppercase">{seg.traffic_level} traffic · {seg.vision_severity} surface</div>
                        </div>
                        <div className="text-[10px] font-label-caps-micro font-bold bg-surface-container-lowest px-space-xs py-space-2xs rounded border text-center leading-none shadow-sm" style={{ color: riskColor(seg.final_score), borderColor: `${riskColor(seg.final_score)}4D` }}>SCORE<br/><span className="text-[14px]">{seg.final_score}</span></div>
                      </div>
                      <div className="flex flex-wrap gap-space-2xs font-label-code-md text-label-code-md font-semibold text-on-surface-variant mb-space-sm">
                        <span className="flex items-center gap-space-2xs bg-surface-container-lowest border border-surface-variant px-space-xs py-space-2xs rounded"><Eye size={12}/> {seg.vision_severity} surface</span>
                        <span className="flex items-center gap-space-2xs bg-surface-container-lowest border border-surface-variant px-space-xs py-space-2xs rounded"><AlertTriangle size={12}/> {seg.news_flags?.length ?? 0} news flags</span>
                      </div>
                      <Link to={`/segment/${seg.segment_id}`} className="block text-right font-label-code-md text-label-code-md font-bold text-secondary hover:underline">View AI Breakdown →</Link>
                    </div>
                  </div>
                ))}
              </div>

              {segments.length > 5 && (
                <Link to="/analytics" className="mt-space-md text-center font-body-sm text-secondary hover:underline">View all {segments.length} segments in Analytics →</Link>
              )}
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-surface-variant">
              <div className="flex justify-between items-center mb-space-md">
                <span className="font-label-caps-micro text-label-caps-micro font-bold uppercase text-on-surface-variant">COMPUTER VISION SAMPLE</span>
                <span className="bg-surface-container-low border border-surface-variant text-on-surface-variant font-label-caps-micro text-label-caps-micro font-bold px-space-xs py-space-2xs rounded">YOLOv8</span>
              </div>
              {shownSegments[0]?.image_url ? (
                <img src={shownSegments[0].image_url} alt="Road surface" className="w-full h-36 object-cover rounded-xl mb-space-sm" />
              ) : (
                <div className="h-36 rounded-xl bg-surface-container flex items-center justify-center text-on-surface-variant font-body-sm mb-space-sm">No image available</div>
              )}
              <div className="flex justify-between font-label-code-md text-label-code-md font-semibold text-on-surface-variant px-space-2xs">
                <span className="flex items-center gap-space-2xs"><CloudSun size={14}/> {shownSegments[0]?.weather_modifier ?? 0 > 0 ? "Wet conditions" : "Clear"}</span>
                <span className="flex items-center gap-space-2xs"><Eye size={14}/> {shownSegments[0]?.vision_source ?? "n/a"}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

function MapIconPlaceholder() {
  return <Navigation size={48} className="text-on-surface-variant mx-auto opacity-40" />;
}

export default RouteResults;