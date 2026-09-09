import { Navigation, ShieldCheck, AlertTriangle, Zap, Download, Eye, CloudSun, CheckCircle } from "lucide-react";

const RouteResults = () => {
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
            <h1 className="font-display-hero text-display-hero text-on-surface tracking-tight font-medium max-w-2xl leading-tight">Gachibowli Junction → Secunderabad<br/>Station</h1>
          </div>
          
          <div className="flex flex-col gap-space-sm">
            <div className="flex bg-surface-container-low border border-surface-variant rounded-full p-1 font-label-code-md text-label-code-md text-on-surface-variant shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
              <div className="py-space-xs px-space-md bg-on-surface text-surface rounded-full flex items-center gap-space-2xs font-semibold shadow-sm"><ShieldCheck size={16}/> Viewing SafeRoute (Recommended)</div>
              <div className="py-space-xs px-space-md flex items-center gap-space-2xs cursor-pointer hover:text-on-surface transition-colors"><Navigation size={16}/> Compare Fastest</div>
            </div>
            <div className="flex gap-space-sm justify-end">
              <button className="bg-secondary-container text-on-secondary-container font-headline-sm text-headline-sm px-space-lg py-space-xs rounded-full flex items-center gap-space-2xs shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"><Navigation size={18} className="rotate-45" /> Start Safe Turn-by-Turn</button>
              <button className="bg-surface-container-lowest text-on-surface border border-surface-variant px-space-md py-space-xs rounded-full shadow-sm hover:bg-surface-container transition-colors"><Download size={18}/></button>
            </div>
          </div>
        </div>

        {/* Route Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md mb-space-xl">
          <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-surface-variant border-2 border-[#2E7D5B]">
            <div className="flex justify-between items-start mb-space-md">
              <div className="flex flex-col gap-space-xs">
                <div className="flex items-center gap-space-xs font-headline-md text-headline-md text-on-surface"><span className="w-3 h-3 rounded-full bg-[#2E7D5B]"></span> Recommended SafeRoute <span className="bg-[#EBF4EF] text-[#2E7D5B] font-label-caps-micro text-label-caps-micro font-bold uppercase px-space-xs py-space-2xs rounded-full border border-[#2E7D5B]/30 shadow-sm ml-space-xs">26/100 MINIMAL RISK</span></div>
                <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm">Route via Bio-Diversity Flyover, Mehdipatnam Expressway & Somajiguda Raj Bhavan Corridor.</p>
              </div>
              <div className="text-right">
                <div className="font-display-hero text-display-hero text-on-surface font-semibold leading-none">26</div>
                <div className="font-label-caps-micro text-label-caps-micro font-bold text-on-surface-variant uppercase mt-space-2xs">COMPOSITE RISK</div>
              </div>
            </div>
            
            <div className="flex gap-space-sm mb-space-md">
              <div className="bg-surface-container-low border border-surface-variant rounded-lg py-space-xs px-space-md text-center flex-1">
                <div className="font-label-caps-micro text-label-caps-micro font-bold text-on-surface-variant uppercase">DISTANCE</div>
                <div className="font-label-code-md text-label-code-md font-semibold text-on-surface">21.0 km</div>
              </div>
              <div className="bg-surface-container-low border border-surface-variant rounded-lg py-space-xs px-space-md text-center flex-1">
                <div className="font-label-caps-micro text-label-caps-micro font-bold text-on-surface-variant uppercase">EST. TIME</div>
                <div className="font-label-code-md text-label-code-md font-semibold text-on-surface">40 mins <span className="text-secondary opacity-80">(+4m)</span></div>
              </div>
              <div className="bg-[#EBF4EF] border border-[#2E7D5B]/30 rounded-lg py-space-xs px-space-md text-center flex-1">
                <div className="font-label-caps-micro text-label-caps-micro font-bold text-[#2E7D5B] uppercase">HAZARDS AVOIDED</div>
                <div className="font-label-code-md text-label-code-md font-semibold text-[#2E7D5B]">100% (5/5)</div>
              </div>
            </div>

            <div className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-space-2xs">
              <CheckCircle size={16} className="text-[#2E7D5B]" /> Grade-separated flyovers • Zero IIT-Delhi Blackspots • Surface dry & drained
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-surface-variant border-2 border-transparent hover:border-[#B93535]/50 transition-colors opacity-70 hover:opacity-100">
            <div className="flex justify-between items-start mb-space-md">
              <div className="flex flex-col gap-space-xs">
                <div className="flex items-center gap-space-xs font-headline-md text-headline-md text-on-surface"><span className="w-3 h-3 rounded-full bg-[#B93535]"></span> Traditional Fastest Route <span className="bg-[#F9EAEA] text-[#B93535] font-label-caps-micro text-label-caps-micro font-bold uppercase px-space-xs py-space-2xs rounded-full border border-[#B93535]/30 shadow-sm ml-space-xs">78/100 SEVERE RISK</span></div>
                <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm">Direct transit via Khairatabad Junction bottleneck and flooded Begumpet Underpass.</p>
              </div>
              <div className="text-right">
                <div className="font-display-hero text-display-hero text-[#B93535] font-semibold leading-none">78</div>
                <div className="font-label-caps-micro text-label-caps-micro font-bold text-[#B93535] uppercase mt-space-2xs">CRITICAL RISK</div>
              </div>
            </div>
            
            <div className="flex gap-space-sm mb-space-md">
              <div className="bg-surface-container-low border border-surface-variant rounded-lg py-space-xs px-space-md text-center flex-1">
                <div className="font-label-caps-micro text-label-caps-micro font-bold text-on-surface-variant uppercase">DISTANCE</div>
                <div className="font-label-code-md text-label-code-md font-semibold text-on-surface">18.2 km</div>
              </div>
              <div className="bg-surface-container-low border border-surface-variant rounded-lg py-space-xs px-space-md text-center flex-1">
                <div className="font-label-caps-micro text-label-caps-micro font-bold text-on-surface-variant uppercase">EST. TIME</div>
                <div className="font-label-code-md text-label-code-md font-semibold text-on-surface">38 mins</div>
              </div>
              <div className="bg-[#F9EAEA] border border-[#B93535]/30 rounded-lg py-space-xs px-space-md text-center flex-1">
                <div className="font-label-caps-micro text-label-caps-micro font-bold text-[#B93535] uppercase">IDENTIFIED FLAWS</div>
                <div className="font-label-code-md text-label-code-md font-semibold text-[#B93535]">3 Blackspots</div>
              </div>
            </div>

            <div className="font-body-sm text-body-sm text-[#B93535] flex items-center gap-space-2xs">
              <AlertTriangle size={16} /> Begumpet Underpass: Waterlogged 45cm • D40 Pothole cluster at Rasoolpura
            </div>
          </div>
        </div>

        {/* Map and Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
          
          {/* Map Area */}
          <div className="lg:col-span-8 flex flex-col gap-space-md">
            <div className="bg-surface-container-lowest rounded-xl p-0 overflow-hidden relative flex-1 min-h-[500px] shadow-sm border border-surface-variant">
              
              {/* Map Controls Overlay */}
              <div className="absolute top-space-md left-space-md right-space-md z-10 flex justify-between flex-wrap gap-space-sm">
                <div className="flex flex-wrap gap-space-xs">
                  <span className="bg-on-surface text-surface font-label-code-md text-label-code-md px-space-sm py-space-2xs rounded-full flex items-center gap-space-2xs shadow-md"><ShieldCheck size={14}/> SafeRoute Nav</span>
                  <span className="bg-surface-container-lowest text-on-surface border border-surface-variant font-label-code-md text-label-code-md px-space-sm py-space-2xs rounded-full flex items-center gap-space-2xs shadow-md hover:bg-surface-container cursor-pointer"><AlertTriangle size={14}/> Blackspots (114)</span>
                  <span className="bg-surface-container-lowest text-on-surface border border-surface-variant font-label-code-md text-label-code-md px-space-sm py-space-2xs rounded-full flex items-center gap-space-2xs shadow-md hover:bg-surface-container cursor-pointer"><Zap size={14}/> YOLOv8 Distress</span>
                  <span className="bg-surface-container-lowest text-on-surface border border-surface-variant font-label-code-md text-label-code-md px-space-sm py-space-2xs rounded-full flex items-center gap-space-2xs shadow-md hover:bg-surface-container cursor-pointer"><CloudSun size={14}/> Drainage Radar</span>
                </div>
                <div className="bg-surface-container-lowest text-on-surface border border-surface-variant px-space-sm py-space-2xs rounded-full shadow-md font-label-caps-micro text-label-caps-micro font-bold uppercase flex items-center gap-space-2xs"><span className="w-2 h-2 rounded-full bg-[#2E7D5B] animate-pulse"></span> H3 O/S SYNC: +0.8M</div>
              </div>

              {/* Fake Map Background */}
              <div className="absolute inset-0 bg-surface-dim/40 bg-[repeating-linear-gradient(45deg,rgba(0,0,0,0.02)_0px,rgba(0,0,0,0.02)_2px,transparent_2px,transparent_16px)]"></div>
              
              {/* Route Polylines (Simulated via CSS for mockup) */}
              <svg className="absolute inset-0 w-full h-full" style={{filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))'}}>
                <path d="M 100 400 Q 200 450 300 350 T 500 250 T 700 150" fill="none" stroke="#2E7D5B" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M 100 400 Q 250 300 400 200 T 700 150" fill="none" stroke="#B93535" strokeWidth="6" strokeDasharray="12 12" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
              </svg>

              {/* Pins */}
              <div className="absolute top-[150px] left-[700px] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="bg-on-surface text-surface text-[10px] font-label-caps-micro uppercase font-bold px-2 py-1 rounded mb-1 whitespace-nowrap shadow-md">SECUNDERABAD STATION</div>
                <div className="w-6 h-6 bg-secondary rounded-full border-2 border-on-surface flex items-center justify-center shadow-lg">
                  <div className="w-2 h-2 bg-on-surface rounded-full"></div>
                </div>
              </div>

              <div className="absolute top-[400px] left-[100px] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="bg-on-surface text-surface text-[10px] font-label-caps-micro uppercase font-bold px-2 py-1 rounded mb-1 whitespace-nowrap shadow-md">START: GACHIBOWLI</div>
                <div className="w-6 h-6 bg-on-surface rounded-full border-2 border-surface flex items-center justify-center shadow-lg">
                  <div className="w-2 h-2 bg-secondary rounded-full"></div>
                </div>
              </div>

              <div className="absolute top-[200px] left-[400px] transform -translate-x-1/2 -translate-y-1/2 z-20">
                <div className="bg-surface-container-lowest border border-[#B93535]/30 rounded-lg p-space-sm shadow-xl w-[220px]">
                   <div className="text-[10px] font-label-caps-micro font-bold text-[#B93535] uppercase mb-space-2xs">SEVERE 88/100</div>
                   <div className="font-headline-sm text-headline-sm mb-space-2xs leading-tight">Begumpet Underpass</div>
                   <div className="font-body-sm text-body-sm text-[#B93535] leading-tight mb-space-xs">Waterlogging 45cm (LiveNav 3 mins ago)</div>
                   <div className="font-label-code-md text-label-code-md text-on-surface-variant flex justify-between mt-space-sm pt-space-xs border-t border-surface-variant"><span>IIT-D Fatality Cluster</span><span className="text-[#B93535] font-bold">+28m delay</span></div>
                </div>
                <div className="w-4 h-4 bg-[#B93535] rounded-full border-2 border-surface-container-lowest absolute -bottom-2 left-1/2 -translate-x-1/2 shadow-sm"></div>
              </div>

              <div className="absolute bottom-space-md left-space-md z-10 flex gap-space-sm bg-surface-container-lowest py-space-xs px-space-md rounded-full shadow-md font-label-caps-micro text-label-caps-micro font-bold uppercase border border-surface-variant">
                <div className="flex items-center gap-space-2xs"><span className="w-3 h-1.5 bg-[#2E7D5B] rounded-full"></span> SAFE CORRIDOR</div>
                <div className="flex items-center gap-space-2xs"><span className="w-3 h-1.5 bg-[#D99B26] rounded-full"></span> MODERATE RISK</div>
                <div className="flex items-center gap-space-2xs"><span className="w-3 h-1.5 bg-[#B93535] rounded-full opacity-60"></span> BYPASSED HAZARDS</div>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-space-md rounded-xl flex justify-between items-center border border-surface-variant shadow-sm flex-wrap gap-space-sm">
              <div className="flex items-center gap-space-md">
                <div className="w-10 h-10 shrink-0 rounded-full bg-secondary-container/20 flex items-center justify-center text-secondary border border-secondary/30">
                  <Zap size={20} />
                </div>
                <div className="flex flex-col gap-space-2xs">
                  <div className="font-headline-sm text-headline-sm font-semibold">Deep Safety Synthesis Active</div>
                  <div className="font-body-sm text-body-sm text-on-surface-variant max-w-lg">Combined weighting: IIT-D Blackspot DB (40%) + YOLOv8 Pavement Scan (35%) + Real-Time Alerts (25%).</div>
                </div>
              </div>
              <div className="flex gap-space-sm font-label-code-md text-label-code-md font-semibold">
                <div className="bg-surface-container-low border border-surface-variant px-space-sm py-space-2xs rounded">Latency: 142ms</div>
                <div className="bg-[#EBF4EF] border border-[#2E7D5B]/30 px-space-sm py-space-2xs rounded text-[#2E7D5B]">Confidence: 97.4%</div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 flex flex-col gap-space-md">
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-surface-variant flex flex-col flex-1">
              <div className="flex justify-between items-center mb-space-xl">
                <div className="font-headline-sm text-headline-sm flex items-center gap-space-xs"><Navigation size={18} className="text-secondary"/> Route Segments</div>
                <div className="font-label-caps-micro text-label-caps-micro font-bold text-on-surface-variant uppercase">5 CRITICAL LEGS</div>
              </div>

              <div className="bg-surface-container-low border border-surface-variant rounded-xl p-space-md mb-space-xl">
                <div className="flex justify-between font-label-caps-micro text-label-caps-micro font-bold mb-space-xs uppercase">
                  <span className="text-on-surface-variant">TOTAL SAFEROUTE SCORE</span>
                  <span className="text-[#2E7D5B]">26 / 100 LOW RISK</span>
                </div>
                <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden mb-space-xs flex">
                  <div className="bg-[#2E7D5B] h-full" style={{width: '26%'}}></div>
                  <div className="bg-[#D99B26] h-full opacity-50" style={{width: '20%'}}></div>
                </div>
                <div className="flex justify-between text-[10px] font-label-caps-micro text-on-surface-variant font-bold uppercase">
                  <span>Bio-Diversity</span>
                  <span>Raj Bhavan</span>
                  <span>Secunderabad</span>
                </div>
              </div>

              <div className="flex flex-col gap-space-md relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-surface-variant">
                
                {/* Segment 1 */}
                <div className="relative pl-10">
                  <div className="absolute left-0 top-1 w-6 h-6 bg-surface-container-lowest border border-surface-variant rounded-full flex items-center justify-center z-10 shadow-sm">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#2E7D5B]"></div>
                  </div>
                  <div className="bg-[#EBF4EF] border border-[#2E7D5B]/30 rounded-xl p-space-md transition-transform hover:-translate-y-0.5 shadow-sm">
                    <div className="flex justify-between items-start mb-space-sm gap-space-xs">
                      <div className="flex flex-col gap-space-2xs">
                        <div className="font-headline-sm text-headline-sm leading-tight">Segment 1: Old Mumbai Hwy</div>
                        <div className="font-label-caps-micro text-label-caps-micro font-bold text-on-surface-variant uppercase">BIO-DIVERSITY TO MEHDIPATNAM • 4.8 KM</div>
                      </div>
                      <div className="text-[10px] font-label-caps-micro font-bold bg-surface-container-lowest text-[#2E7D5B] px-space-xs py-space-2xs rounded border border-[#2E7D5B]/30 text-center leading-none shadow-sm">SCORE<br/><span className="text-[14px]">32</span></div>
                    </div>
                    <div className="flex flex-wrap gap-space-2xs font-label-code-md text-label-code-md font-semibold text-on-surface-variant mb-space-sm">
                      <span className="flex items-center gap-space-2xs bg-surface-container-lowest border border-surface-variant px-space-xs py-space-2xs rounded"><Eye size={12}/> Vision: Clean asphalt</span>
                      <span className="flex items-center gap-space-2xs bg-surface-container-lowest border border-surface-variant px-space-xs py-space-2xs rounded"><AlertTriangle size={12}/> News: 0 Incidents</span>
                    </div>
                    <div className="text-right font-label-code-md text-label-code-md font-bold text-secondary cursor-pointer hover:underline">View AI Breakdown →</div>
                  </div>
                </div>

                {/* Segment 2 */}
                <div className="relative pl-10">
                  <div className="absolute left-0 top-1 w-6 h-6 bg-surface-container-lowest border border-surface-variant rounded-full flex items-center justify-center z-10 shadow-sm">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#D99B26]"></div>
                  </div>
                  <div className="bg-surface-container-low border border-surface-variant rounded-xl p-space-md transition-transform hover:-translate-y-0.5 shadow-sm">
                    <div className="flex justify-between items-start mb-space-sm gap-space-xs">
                      <div className="flex flex-col gap-space-2xs">
                        <div className="font-headline-sm text-headline-sm leading-tight">Segment 2: Mehdipatnam → Masab Tank</div>
                        <div className="font-label-caps-micro text-label-caps-micro font-bold text-on-surface-variant uppercase">PVNR EXPRESSWAY SLIP • 3.2 KM</div>
                      </div>
                      <div className="text-[10px] font-label-caps-micro font-bold bg-surface-container-lowest text-[#D99B26] px-space-xs py-space-2xs rounded border border-[#D99B26]/30 text-center leading-none shadow-sm">SCORE<br/><span className="text-[14px]">52</span></div>
                    </div>
                    <div className="flex flex-wrap gap-space-2xs font-label-code-md text-label-code-md font-semibold text-on-surface-variant mb-space-sm">
                      <span className="flex items-center gap-space-2xs bg-surface-container-lowest border border-surface-variant px-space-xs py-space-2xs rounded"><Eye size={12} className="text-[#D99B26]"/> Vision: D20 Cracks</span>
                      <span className="flex items-center gap-space-2xs bg-surface-container-lowest border border-surface-variant px-space-xs py-space-2xs rounded"><AlertTriangle size={12}/> News: Dense merge</span>
                    </div>
                    <div className="text-right font-label-code-md text-label-code-md font-bold text-secondary cursor-pointer hover:underline">View AI Breakdown →</div>
                  </div>
                </div>

                {/* Segment 3 */}
                <div className="relative pl-10">
                  <div className="absolute left-0 top-1 w-6 h-6 bg-surface-container-lowest border border-surface-variant rounded-full flex items-center justify-center z-10 shadow-sm">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#2E7D5B]"></div>
                  </div>
                  <div className="bg-[#EBF4EF] border border-[#2E7D5B]/30 rounded-xl p-space-md transition-transform hover:-translate-y-0.5 shadow-sm">
                    <div className="flex justify-between items-start mb-space-sm gap-space-xs">
                      <div className="flex flex-col gap-space-2xs">
                        <div className="font-headline-sm text-headline-sm leading-tight">Segment 3: Khairatabad Arterial Bypass</div>
                        <div className="font-label-caps-micro text-label-caps-micro font-bold text-on-surface-variant uppercase">INNER RING ELEVATED STILT • 3.8 KM</div>
                      </div>
                      <div className="text-[10px] font-label-caps-micro font-bold bg-surface-container-lowest text-[#2E7D5B] px-space-xs py-space-2xs rounded border border-[#2E7D5B]/30 text-center leading-none shadow-sm">SCORE<br/><span className="text-[14px]">24</span></div>
                    </div>
                    <div className="flex flex-wrap gap-space-2xs font-label-code-md text-label-code-md font-semibold text-on-surface-variant mb-space-sm">
                      <span className="flex items-center gap-space-2xs bg-surface-container-lowest border border-surface-variant px-space-xs py-space-2xs rounded"><Eye size={12}/> Vision: Re-paved smooth</span>
                      <span className="flex items-center gap-space-2xs bg-surface-container-lowest border border-surface-variant px-space-xs py-space-2xs rounded"><CheckCircle size={12}/> News: Clear flow</span>
                    </div>
                    <div className="text-right font-label-code-md text-label-code-md font-bold text-secondary cursor-pointer hover:underline">View AI Breakdown →</div>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-space-md border-t border-surface-variant flex justify-between items-center gap-space-sm">
                <div className="flex items-start gap-space-xs">
                  <ShieldCheck size={24} className="text-[#2E7D5B] shrink-0"/>
                  <div className="flex flex-col gap-space-2xs">
                    <div className="font-headline-sm text-headline-sm">88.7% Safer Transit</div>
                    <div className="font-body-sm text-body-sm text-on-surface-variant">0 Fatal Blackspots Encountered</div>
                  </div>
                </div>
                <button className="bg-surface-container-low border border-surface-variant text-on-surface font-label-caps-micro text-label-caps-micro font-bold px-space-sm py-space-2xs rounded-lg hover:bg-surface-container transition-colors shadow-sm uppercase text-center leading-tight">FULL<br/>AUDIT</button>
              </div>

            </div>

            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-surface-variant">
              <div className="flex justify-between items-center mb-space-md">
                <span className="font-label-caps-micro text-label-caps-micro font-bold uppercase text-on-surface-variant">COMPUTER VISION FEED SAMPLE</span>
                <span className="bg-surface-container-low border border-surface-variant text-on-surface-variant font-label-caps-micro text-label-caps-micro font-bold px-space-xs py-space-2xs rounded">YOLOv8 ON-DEVICE</span>
              </div>
              <div className="relative rounded-xl overflow-hidden mb-space-sm bg-surface-container-high h-36 border border-surface-variant">
                 <div className="absolute inset-0 flex items-center justify-center text-on-surface-variant font-label-code-md text-label-code-md font-semibold bg-surface-variant/40">
                   [Camera Feed Image Mockup]
                 </div>
                 <div className="absolute top-space-xs left-space-xs bg-on-surface/80 text-surface font-label-caps-micro text-label-caps-micro font-bold px-space-xs py-space-2xs rounded backdrop-blur-sm">Segment 4 - Somajiguda Cam #08</div>
                 <div className="absolute bottom-space-xs right-space-xs bg-[#2E7D5B]/90 text-surface font-label-caps-micro text-label-caps-micro font-bold px-space-xs py-space-2xs rounded backdrop-blur-sm border border-[#2E7D5B]">0 Structural Anomalies</div>
              </div>
              <div className="flex justify-between font-label-code-md text-label-code-md font-semibold text-on-surface-variant px-space-2xs">
                <span className="flex items-center gap-space-2xs"><CloudSun size={14}/> 28°C Dry & Clear</span>
                <span className="flex items-center gap-space-2xs"><Eye size={14}/> Visibility: 10 km</span>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default RouteResults;
