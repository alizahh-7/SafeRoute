import { MapPin, Navigation, Car, Bike, Ambulance, Search, Clock, CloudRain, Star, ShieldCheck, Zap, Cpu, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RoutePlanner = () => {
  const navigate = useNavigate();
  return (
    <div className="w-full pt-20 bg-background min-h-screen pb-space-3xl">
      <div className="max-w-[1440px] mx-auto px-layout-margin-mobile md:px-layout-margin-tablet lg:px-layout-margin-desktop pt-space-xl">
        
        {/* Header Section */}
        <div className="flex gap-space-2xs items-center mb-space-md font-label-caps-micro text-label-caps-micro uppercase text-on-surface-variant">
          <span className="flex items-center gap-space-2xs text-secondary font-bold">
            <Zap size={14} className="text-secondary" /> AI MOBILITY GUIDANCE - LIVE INTELLIGENCE
          </span>
        </div>
        
        <h1 className="font-display-hero text-display-hero text-on-surface tracking-tight font-medium max-w-2xl mb-space-md">
          Plan a Safer Commute across <br/><span className="text-secondary">Telangana</span>
        </h1>
        
        <div className="flex flex-wrap items-center gap-space-sm mb-space-2xl">
          <div className="bg-surface-container-lowest text-on-surface border border-surface-variant px-space-md py-space-xs rounded-full font-label-code-md text-label-code-md flex items-center gap-space-2xs shadow-sm">
            <span className="w-2 h-2 bg-secondary rounded-full animate-pulse"></span> Hyderabad 28°C
          </div>
          <div className="bg-error-container/40 text-on-error-container border border-error/30 px-space-md py-space-xs rounded-full font-label-code-md text-label-code-md flex items-center gap-space-2xs shadow-sm">
            <CloudRain size={16} className="text-error" /> Monsoon Advisory: Moderate Waterlogging Alert along Moazzam Jahi & Musi basin
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg mb-space-3xl">
          
          {/* Planner Card */}
          <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl p-space-xl shadow-sm border border-surface-variant flex flex-col">
            <div className="flex justify-between items-start mb-space-lg flex-wrap gap-space-md">
              <div className="flex flex-col gap-space-2xs">
                <div className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-space-xs">
                  <ShieldCheck size={20} className="text-secondary" /> Multi-Criteria Safe Corridors
                </div>
                <div className="font-body-sm text-body-sm text-on-surface-variant">Weighted dynamic routing balancing crash density, road damage, and inundation</div>
              </div>
              <div className="flex p-1 bg-surface-container-low border border-surface-variant rounded-full font-label-code-md text-label-code-md text-on-surface-variant">
                <div className="py-space-2xs px-space-sm bg-on-surface text-surface rounded-full flex items-center gap-space-2xs font-semibold shadow-sm"><Car size={16}/> Four-Wheeler</div>
                <div className="py-space-2xs px-space-sm flex items-center gap-space-2xs cursor-pointer hover:text-on-surface transition-colors"><Bike size={16}/> Two-Wheeler</div>
                <div className="py-space-2xs px-space-sm flex items-center gap-space-2xs cursor-pointer hover:text-on-surface transition-colors">Auto</div>
                <div className="py-space-2xs px-space-sm flex items-center gap-space-2xs cursor-pointer hover:text-on-surface transition-colors"><Ambulance size={16}/> Emergency</div>
              </div>
            </div>

            {/* Inputs */}
            <div className="bg-surface-container-low border border-surface-variant rounded-xl p-space-md mb-space-lg">
              <div className="flex gap-space-sm items-center mb-space-sm">
                <div className="w-10 h-10 rounded-full bg-surface-container-lowest border border-surface-variant flex items-center justify-center shrink-0 text-on-surface-variant"><MapPin size={18}/></div>
                <div className="flex-1 bg-surface-container-lowest border border-surface-variant rounded-full px-space-md py-space-sm font-body-md text-body-md text-on-surface">Gachibowli Bio-Diversity Junction - Hyderabad</div>
                <button className="bg-surface-container text-on-surface px-space-md py-space-sm rounded-full font-label-code-md text-label-code-md flex items-center gap-space-2xs hover:bg-surface-variant transition-colors"><Navigation size={14}/> Current Location</button>
              </div>
              <div className="flex gap-space-sm items-center mb-space-sm">
                <div className="w-10 h-10 rounded-full bg-surface-container-lowest border border-surface-variant flex items-center justify-center shrink-0 text-error"><MapPin size={18}/></div>
                <div className="flex-1 bg-surface-container-lowest border border-surface-variant rounded-full px-space-md py-space-sm font-body-md text-body-md text-on-surface">Secunderabad Railway Station - Hyderabad</div>
                <button className="w-10 h-10 rounded-full bg-secondary text-on-secondary flex items-center justify-center hover:bg-secondary-fixed transition-colors"><Search size={18}/></button>
              </div>
              <div className="flex flex-wrap items-center gap-space-sm pt-space-xs pl-13">
                <span className="font-label-caps-micro text-label-caps-micro uppercase text-on-surface-variant font-bold">FREQUENT HUBS:</span> 
                <span className="bg-surface-container-lowest border border-surface-variant px-space-sm py-space-2xs rounded-full font-body-sm text-body-sm cursor-pointer hover:bg-surface-container transition-colors">Cyber Towers</span>
                <span className="bg-surface-container-lowest border border-surface-variant px-space-sm py-space-2xs rounded-full font-body-sm text-body-sm cursor-pointer hover:bg-surface-container transition-colors">RGI Airport</span>
                <span className="bg-surface-container-lowest border border-surface-variant px-space-sm py-space-2xs rounded-full font-body-sm text-body-sm cursor-pointer hover:bg-surface-container transition-colors">Old City</span>
                <span className="bg-surface-container-lowest border border-surface-variant px-space-sm py-space-2xs rounded-full font-body-sm text-body-sm cursor-pointer hover:bg-surface-container transition-colors">Ameerpet Metro</span>
              </div>
            </div>

            <div className="flex justify-between items-center mb-space-md">
              <div className="font-label-caps-micro text-label-caps-micro uppercase text-on-surface-variant font-bold">ALGORITHMIC SAFETY FILTERS</div>
              <div className="font-label-code-md text-label-code-md text-secondary font-bold bg-secondary-container/20 px-space-xs py-space-2xs rounded-full">OpenRouteService Custom Weighting</div>
            </div>

            {/* Filter Checkboxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm mb-space-lg">
              <label className="flex items-start gap-space-sm p-space-md border-2 border-secondary bg-secondary-container/10 rounded-xl cursor-pointer transition-colors hover:bg-secondary-container/20">
                <input type="checkbox" checked readOnly className="mt-1 w-4 h-4 accent-secondary" />
                <div className="flex flex-col gap-space-2xs">
                  <div className="font-headline-sm text-headline-sm text-on-surface">Avoid High-Crash Corridors</div>
                  <div className="font-body-sm text-body-sm text-on-surface-variant">Bypasses Top 20 Telangana MoRTH blackspots</div>
                </div>
              </label>
              <label className="flex items-start gap-space-sm p-space-md border-2 border-secondary bg-secondary-container/10 rounded-xl cursor-pointer transition-colors hover:bg-secondary-container/20">
                <input type="checkbox" checked readOnly className="mt-1 w-4 h-4 accent-secondary" />
                <div className="flex flex-col gap-space-2xs">
                  <div className="font-headline-sm text-headline-sm text-on-surface">Avoid Waterlogged Links</div>
                  <div className="font-body-sm text-body-sm text-on-surface-variant">Live GHMC Musi river basin flood sensors</div>
                </div>
              </label>
              <label className="flex items-start gap-space-sm p-space-md border-2 border-secondary bg-secondary-container/10 rounded-xl cursor-pointer transition-colors hover:bg-secondary-container/20">
                <input type="checkbox" checked readOnly className="mt-1 w-4 h-4 accent-secondary" />
                <div className="flex flex-col gap-space-2xs">
                  <div className="font-headline-sm text-headline-sm text-on-surface">Surface Quality Priority</div>
                  <div className="font-body-sm text-body-sm text-on-surface-variant">Penalizes RDD2022 severe pothole clusters</div>
                </div>
              </label>
              <label className="flex items-start gap-space-sm p-space-md border border-surface-variant bg-surface-container-low rounded-xl cursor-pointer transition-colors hover:bg-surface-container">
                <input type="checkbox" readOnly className="mt-1 w-4 h-4" />
                <div className="flex flex-col gap-space-2xs opacity-70">
                  <div className="font-headline-sm text-headline-sm text-on-surface">Night Lighting & Flyovers</div>
                  <div className="font-body-sm text-body-sm text-on-surface-variant">Prioritize multi-illuminated carriageways</div>
                </div>
              </label>
            </div>

            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-space-md mb-space-lg border-t border-surface-variant pt-space-lg">
              <div className="flex items-center gap-space-xs font-body-md text-body-md text-on-surface">
                <Clock size={18} className="text-on-surface-variant" /> Departure: 
                <select className="bg-surface-container-low border border-surface-variant rounded-full px-space-md py-space-xs font-label-code-md text-label-code-md outline-none focus:border-secondary">
                  <option>Leave Now (Peak Evening Rush)</option>
                </select>
              </div>
              <div className="bg-secondary-container text-on-secondary-container px-space-md py-space-xs rounded-full font-label-caps-micro text-label-caps-micro font-bold uppercase shadow-sm">
                Est. Risk Reduction: ~64% vs Standard GPS
              </div>
            </div>

            <button onClick={() => navigate('/route')} className="w-full bg-on-surface text-surface py-space-md rounded-full font-headline-sm text-headline-sm flex items-center justify-center gap-space-sm hover:bg-on-surface-variant transition-colors shadow-md hover:shadow-lg hover:-translate-y-0.5">
              <Navigation size={20} /> Analyze Corridor Safety & Fetch Routes
            </button>
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-4 flex flex-col gap-space-lg">
            {/* Model Evaluation Card */}
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-surface-variant flex flex-col h-full">
              <div className="flex justify-between items-start mb-space-lg">
                <span className="font-label-caps-micro text-label-caps-micro uppercase text-on-surface-variant font-bold">MODEL EVALUATION</span>
                <span className="bg-surface-container-low text-on-surface-variant border border-surface-variant px-space-xs py-space-2xs rounded-full font-label-code-md text-label-code-md">v2.4 Active</span>
              </div>
              
              <div className="flex items-center gap-space-md mb-space-xl">
                <div className="w-20 h-20 shrink-0 rounded-full border-[6px] border-secondary flex items-center justify-center">
                  <span className="font-display-hero-mobile text-display-hero-mobile text-on-surface">82</span>
                </div>
                <div className="flex flex-col gap-space-2xs">
                  <div className="font-headline-md text-headline-md text-on-surface leading-tight">High Route Confidence</div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Aggregating real-time telemetry from 32 road weather cameras and traffic grid stations.</p>
                </div>
              </div>
              
              <div className="flex flex-col gap-space-2xs mb-space-xl">
                <div className="flex justify-between font-label-caps-micro text-label-caps-micro uppercase font-bold text-on-surface-variant">
                  <span>Blackspot Mitigation Progress</span>
                  <span className="text-secondary">74% Target</span>
                </div>
                <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden">
                  <div className="bg-secondary h-full rounded-full" style={{width: '74%'}}></div>
                </div>
              </div>
              
              <div className="mt-auto bg-surface-container-low border border-surface-variant p-space-sm rounded-lg flex items-center justify-between font-label-code-md text-label-code-md text-on-surface-variant cursor-pointer hover:bg-surface-container transition-colors">
                <span className="flex items-center gap-space-2xs"><Cpu size={16} className="text-secondary"/> IIT Delhi Neural Engine (10k+ km)</span>
                <Navigation size={14} className="rotate-45" />
              </div>
            </div>
            
            {/* Live Heatmap Teaser */}
            <div className="bg-surface-container-lowest rounded-xl p-0 overflow-hidden relative shadow-sm border border-surface-variant h-48 group">
              <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,rgba(0,0,0,0.05)_0px,rgba(0,0,0,0.05)_2px,transparent_2px,transparent_8px)] opacity-60"></div>
              <div className="absolute inset-0 bg-linear-to-t from-surface-tint/60 to-transparent"></div>
              
              <div className="absolute bottom-space-md left-space-md right-space-md flex justify-between items-end z-10">
                <div className="flex flex-col gap-space-2xs">
                  <div className="font-label-caps-micro text-label-caps-micro text-secondary-container font-bold tracking-widest">LIVE DROPOUT GRID</div>
                  <div className="text-surface font-headline-sm text-headline-sm drop-shadow-md">Hyderabad Metrowide<br/>Grid</div>
                </div>
                <button onClick={() => navigate('/analytics')} className="bg-surface-container-lowest text-on-surface px-space-md py-space-xs rounded-full font-label-code-md text-label-code-md flex items-center gap-space-2xs hover:bg-surface-container transition-colors shadow-sm group-hover:scale-105">
                  View Heatmap <MapPin size={14}/>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Route Alternatives Header */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-space-sm mb-space-lg">
          <h3 className="font-headline-lg text-headline-lg text-on-surface">High-Traffic Telangana Corridors</h3>
          <span className="font-label-caps-micro text-label-caps-micro text-on-surface-variant font-bold flex items-center gap-space-2xs uppercase bg-surface-container-low px-space-sm py-space-2xs rounded-full">
            <span className="w-2 h-2 rounded-full bg-[#D99B26] animate-pulse"></span> Updated every 15 mins
          </span>
        </div>
        <p className="font-body-lg text-body-lg text-on-surface-variant mb-space-xl max-w-3xl">Recent AI generated multi-criteria vulnerability assessments for frequent capital arteries. These historical metrics help contextualize live scoring.</p>

        {/* Route Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-space-md mb-space-3xl">
          
          <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-surface-variant border-t-4 border-t-[#D99B26] flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex flex-col gap-space-sm mb-space-xl">
              <div className="flex justify-between items-center">
                <span className="bg-[#FAF4E6] text-[#D99B26] border border-[#D99B26]/20 px-space-xs py-space-2xs rounded-full font-label-caps-micro text-label-caps-micro uppercase font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 bg-[#D99B26] rounded-full"></span> MODERATE RISK</span>
                <span className="font-label-code-md text-label-code-md text-on-surface-variant font-semibold">16.2 km</span>
              </div>
              <h4 className="font-headline-sm text-headline-sm text-on-surface leading-snug">HITEC City Cyber Towers → Begumpet Airport Rd</h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Moderate bottlenecking around Panjagutta. 2 historical crash zones flagged near lifestyle flyover.</p>
            </div>
            <div className="flex flex-col gap-space-xs border-t border-surface-variant pt-space-md">
              <div className="flex justify-between font-label-code-md text-label-code-md font-semibold">
                <span className="text-on-surface-variant">Historical Risk Score</span>
                <span className="text-[#D99B26]">48 / 100</span>
              </div>
              <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden mb-space-xs">
                <div className="bg-[#D99B26] h-full rounded-full" style={{width: '48%'}}></div>
              </div>
              <button className="font-label-code-md text-label-code-md text-secondary font-bold flex items-center justify-end gap-space-2xs hover:underline mt-space-2xs">Select this route <Navigation size={14} className="rotate-90"/></button>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-surface-variant border-t-4 border-t-[#D36128] flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex flex-col gap-space-sm mb-space-xl">
              <div className="flex justify-between items-center">
                <span className="bg-[#FAEEE8] text-[#D36128] border border-[#D36128]/20 px-space-xs py-space-2xs rounded-full font-label-caps-micro text-label-caps-micro uppercase font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 bg-[#D36128] rounded-full"></span> HIGH RISK</span>
                <span className="font-label-code-md text-label-code-md text-on-surface-variant font-semibold">11.8 km</span>
              </div>
              <h4 className="font-headline-sm text-headline-sm text-on-surface leading-snug">Banjara Hills Rd No. 12 → Charminar Old City</h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Dense pedestrian activity, mixed commerce traffic, and active roadworks along Nayapul bridge.</p>
            </div>
            <div className="flex flex-col gap-space-xs border-t border-surface-variant pt-space-md">
              <div className="flex justify-between font-label-code-md text-label-code-md font-semibold">
                <span className="text-on-surface-variant">Historical Risk Score</span>
                <span className="text-[#D36128]">84 / 100</span>
              </div>
              <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden mb-space-xs">
                <div className="bg-[#D36128] h-full rounded-full" style={{width: '84%'}}></div>
              </div>
              <button className="font-label-code-md text-label-code-md text-[#D36128] font-bold flex items-center justify-end gap-space-2xs hover:underline mt-space-2xs">Select this route <Navigation size={14} className="rotate-90"/></button>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-surface-variant border-t-4 border-t-[#2E7D5B] flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex flex-col gap-space-sm mb-space-xl">
              <div className="flex justify-between items-center">
                <span className="bg-[#EBF4EF] text-[#2E7D5B] border border-[#2E7D5B]/20 px-space-xs py-space-2xs rounded-full font-label-caps-micro text-label-caps-micro uppercase font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 bg-[#2E7D5B] rounded-full"></span> LOW RISK</span>
                <span className="font-label-code-md text-label-code-md text-on-surface-variant font-semibold">28.5 km</span>
              </div>
              <h4 className="font-headline-sm text-headline-sm text-on-surface leading-snug">Financial District → Shamshabad Airport</h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Grade-separated expressway with continuous street illumination and automated incident cameras.</p>
            </div>
            <div className="flex flex-col gap-space-xs border-t border-surface-variant pt-space-md">
              <div className="flex justify-between font-label-code-md text-label-code-md font-semibold">
                <span className="text-on-surface-variant">Historical Risk Score</span>
                <span className="text-[#2E7D5B]">19 / 100</span>
              </div>
              <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden mb-space-xs">
                <div className="bg-[#2E7D5B] h-full rounded-full" style={{width: '19%'}}></div>
              </div>
              <button className="font-label-code-md text-label-code-md text-secondary font-bold flex items-center justify-end gap-space-2xs hover:underline mt-space-2xs">Select this route <Navigation size={14} className="rotate-90"/></button>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-surface-variant border-t-4 border-t-[#B93535] flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex flex-col gap-space-sm mb-space-xl">
              <div className="flex justify-between items-center">
                <span className="bg-[#F9EAEA] text-[#B93535] border border-[#B93535]/20 px-space-xs py-space-2xs rounded-full font-label-caps-micro text-label-caps-micro uppercase font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 bg-[#B93535] rounded-full"></span> SEVERE WARNING</span>
                <span className="font-label-code-md text-label-code-md text-on-surface-variant font-semibold">8.4 km</span>
              </div>
              <h4 className="font-headline-sm text-headline-sm text-on-surface leading-snug">Kukatpally Y-Junction → Ameerpet Metro Hub</h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Severe surface distress (RDD2022 Class 30+ potholes) combined with heavy metro corridor congestion.</p>
            </div>
            <div className="flex flex-col gap-space-xs border-t border-surface-variant pt-space-md">
              <div className="flex justify-between font-label-code-md text-label-code-md font-semibold">
                <span className="text-on-surface-variant">Historical Risk Score</span>
                <span className="text-[#B93535]">72 / 100</span>
              </div>
              <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden mb-space-xs">
                <div className="bg-[#B93535] h-full rounded-full" style={{width: '72%'}}></div>
              </div>
              <button className="font-label-code-md text-label-code-md text-[#B93535] font-bold flex items-center justify-end gap-space-2xs hover:underline mt-space-2xs">Select this route <Navigation size={14} className="rotate-90"/></button>
            </div>
          </div>

        </div>

        {/* Bottom Section: Saved Commutes & Live Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg pb-space-2xl">
          
          <div className="lg:col-span-4 bg-surface-container-lowest rounded-xl p-space-xl shadow-sm border border-surface-variant flex flex-col items-center justify-center text-center relative h-full">
            <div className="absolute top-space-md left-space-md font-label-code-md text-label-code-md text-on-surface-variant flex items-center gap-space-2xs font-semibold"><MapPin size={16}/> My Saved Commutes</div>
            <div className="absolute top-space-md right-space-md font-label-code-md text-label-code-md text-on-surface-variant font-semibold">0 Active</div>
            
            <div className="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center mt-space-xl mb-space-md">
              <Star size={32} className="text-on-surface-variant opacity-50" />
            </div>
            <h4 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs">No Saved Commutes Yet</h4>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-lg max-w-[240px]">Star your daily routes to receive automated 30-minute pre-depart alerts via SMS and WhatsApp API.</p>
            <button onClick={() => navigate('/saved-corridors')} className="bg-surface-container-low border border-surface-variant text-on-surface px-space-lg py-space-sm rounded-full font-label-code-md text-label-code-md font-semibold hover:bg-surface-container transition-colors shadow-sm">
              + Add Daily Commute
            </button>

            <div className="w-full absolute bottom-space-md left-0 px-space-md">
              <div className="flex justify-between items-center border-t border-surface-variant pt-space-sm font-label-caps-micro text-label-caps-micro uppercase font-bold">
                <span className="text-on-surface-variant">Synced with Hyderabad Metro</span>
                <span className="text-secondary cursor-pointer hover:underline">Enable Push Alerts</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl p-space-xl shadow-sm border border-surface-variant flex flex-col relative h-full">
            <div className="flex flex-wrap justify-between items-center mb-space-lg border-b border-surface-variant pb-space-sm gap-space-md">
              <div className="flex items-center gap-space-2xs font-label-caps-micro text-label-caps-micro text-error uppercase font-bold">
                <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span> LIVE INCIDENT FEED - VERIFIED 5 MINS AGO
              </div>
              <div className="font-label-code-md text-label-code-md text-on-surface-variant font-semibold">Telangana Traffic Police Dispatch</div>
            </div>

            <div className="flex flex-col gap-space-md">
              <div className="flex gap-space-md p-space-md border border-error bg-error-container/20 rounded-xl">
                <div className="mt-1 shrink-0"><AlertTriangle size={20} className="text-error" /></div>
                <div className="flex flex-col gap-space-2xs">
                  <h5 className="font-headline-sm text-headline-sm text-error">Malakpet Underbridge Inundation</h5>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Waterlogging overflow at 42cm reported near the Musi Railway Underbridge. Two-wheelers advised to divert via Chaderghat or Azampura flyovers.</p>
                </div>
              </div>

              <div className="flex gap-space-md p-space-md border border-secondary bg-secondary-container/10 rounded-xl">
                <div className="mt-1 shrink-0"><Zap size={20} className="text-secondary" /></div>
                <div className="flex flex-col gap-space-2xs">
                  <h5 className="font-headline-sm text-headline-sm text-secondary">YOLOv8 Detection Flag • Outer Ring Road</h5>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Raw detection of a Class-D40 pothole cluster at 22:08. Service Travel approaching Narsingi ramps - left 1B - highway maintenance team dispatched.</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center mt-space-lg pt-space-sm border-t border-surface-variant font-label-code-md text-label-code-md gap-space-xs">
              <span className="text-on-surface-variant font-semibold">Crowdsourced validation via Mapillary Street API</span>
              <span className="text-secondary font-bold cursor-pointer hover:underline flex items-center gap-1">View all 16 active incident pins <Navigation size={14} className="rotate-90"/></span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RoutePlanner;
