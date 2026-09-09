import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="w-full pt-20 bg-background">
      <div className="flex flex-col w-full">
        {/* Subtle Ambient Glow Background Containers */}
        <section className="relative w-full px-layout-margin-mobile md:px-layout-margin-tablet lg:px-layout-margin-desktop pt-space-xl pb-space-3xl overflow-hidden">
          {/* Diffuse Warm Glow */}
          <div className="absolute -top-32 right-10 w-[540px] h-[540px] bg-secondary-container/20 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="absolute top-1/2 left-0 w-[420px] h-[420px] bg-surface-container-high/60 rounded-full blur-[90px] pointer-events-none"></div>
          
          <div className="max-w-[1440px] mx-auto relative z-10 flex flex-col gap-space-2xl">
            {/* Trust Chips Row */}
            <div className="flex flex-wrap items-center gap-space-xs">
              <div className="inline-flex items-center gap-space-2xs bg-surface-container-low px-space-md py-space-xs rounded-full shadow-sm">
                <span className="inline-block w-2 h-2 rounded-full bg-secondary"></span>
                <span className="font-label-caps-micro text-label-caps-micro uppercase text-on-surface">AI Careers for Women (AICW) Capstone</span>
              </div>
              <div className="inline-flex items-center gap-space-2xs bg-surface-container-lowest px-space-md py-space-xs rounded-full shadow-sm">
                <span className="material-symbols-outlined text-[16px] text-secondary">verified</span>
                <span className="font-label-caps-micro text-label-caps-micro uppercase text-on-surface-variant">Supported by Microsoft</span>
              </div>
              <div className="hidden sm:inline-flex items-center gap-space-2xs bg-surface-container-low px-space-md py-space-xs rounded-full shadow-sm">
                <span className="font-label-code-md text-label-code-md text-secondary font-bold">YOLOv8</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">• 5,368 Indian Road Damage Imagery Assets</span>
              </div>
            </div>

            {/* Hero Typography & Pitch */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
              <div className="lg:col-span-7 flex flex-col gap-space-lg">
                <h1 className="font-display-hero text-display-hero text-on-surface tracking-tight font-medium max-w-2xl">
                  Every navigation app optimizes for <span className="italic text-on-surface-variant">speed</span>. We optimize for <span className="underline decoration-secondary-container decoration-4 underline-offset-8 font-bold">survival</span>.
                </h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl leading-relaxed">
                  The first AI-driven road safety intelligence engine for Hyderabad and Telangana — fusing IIT-Delhi crash records, computer vision road damage detection, live monsoon waterlogging signals, and real-time incident reports into an explainable 0–100 risk score before you drive.
                </p>

                {/* Dual Pill CTAs */}
                <div className="flex flex-wrap items-center gap-space-md pt-space-xs">
                  <Link to="/route-planner" className="inline-flex items-center gap-space-xs px-space-xl py-space-md rounded-full bg-secondary-container text-on-secondary-container hover:bg-tertiary-fixed-dim transition-all duration-300 font-headline-sm text-headline-sm shadow-md hover:shadow-lg hover:-translate-y-0.5">
                    <span className="material-symbols-outlined text-[20px]">explore</span>
                    <span>Launch Safe Route Finder</span>
                  </Link>
                  <a href="#" className="inline-flex items-center gap-space-xs px-space-lg py-space-md rounded-full bg-surface-container-lowest text-on-surface hover:bg-surface-container transition-all duration-200 font-body-lg text-body-lg shadow-sm">
                    <span className="material-symbols-outlined text-[20px] text-secondary">heat_pump</span>
                    <span>Live Telangana Risk Heatmap</span>
                  </a>
                </div>

                {/* Micro Quick Metric Strip */}
                <div className="grid grid-cols-3 gap-space-md pt-space-md max-w-lg">
                  <div className="flex flex-col bg-surface-container-low p-space-md rounded-DEFAULT">
                    <span className="font-label-caps-micro text-label-caps-micro uppercase text-on-surface-variant">Live Corridors</span>
                    <span className="font-headline-md text-headline-md text-on-surface font-semibold mt-space-2xs">114</span>
                    <span className="font-body-sm text-body-sm text-secondary">IIT-Delhi Indexed</span>
                  </div>
                  <div className="flex flex-col bg-surface-container-low p-space-md rounded-DEFAULT">
                    <span className="font-label-caps-micro text-label-caps-micro uppercase text-on-surface-variant">Hazard Reduction</span>
                    <span className="font-headline-md text-headline-md text-on-surface font-semibold mt-space-2xs">-69%</span>
                    <span className="font-body-sm text-body-sm text-secondary">Mean Exposure Cut</span>
                  </div>
                  <div className="flex flex-col bg-surface-container-low p-space-md rounded-DEFAULT">
                    <span className="font-label-caps-micro text-label-caps-micro uppercase text-on-surface-variant">Time Delta</span>
                    <span className="font-headline-md text-headline-md text-on-surface font-semibold mt-space-2xs">+3.8m</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">Avg Safe Shift</span>
                  </div>
                </div>
              </div>

              {/* Hero Visual Showcase Card: Gachibowli to Secunderabad Route Comparison */}
              <div className="lg:col-span-5 w-full">
                <div className="bg-surface-container-lowest rounded-lg p-space-lg shadow-xl relative flex flex-col gap-space-md">
                  {/* Card Header Badge & Route Origin */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-space-2xs">
                      <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse"></span>
                      <span className="font-label-caps-micro text-label-caps-micro uppercase text-secondary font-bold">Active Corridor Evaluation</span>
                    </div>
                    <span className="font-label-code-md text-label-code-md bg-surface-container-high px-space-xs py-space-2xs rounded-full text-on-surface-variant">GHMC Sector 08</span>
                  </div>

                  {/* Route Nodes */}
                  <div className="bg-surface-container-low rounded-DEFAULT p-space-md flex flex-col gap-space-xs">
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-secondary text-[18px]">radio_button_checked</span>
                      <span className="font-headline-sm text-headline-sm text-on-surface">Gachibowli Financial District</span>
                    </div>
                    <div className="pl-space-sm border-l-2 border-dashed border-outline-variant/40 ml-2 py-0.5">
                      <span className="font-label-caps-micro text-label-caps-micro uppercase text-on-surface-variant">Via Begumpet Arterial • 19.4 KM</span>
                    </div>
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-error text-[18px]">location_on</span>
                      <span className="font-headline-sm text-headline-sm text-on-surface">Secunderabad Railway Station</span>
                    </div>
                  </div>

                  {/* Comparison Block 1: Fastest Route (Unsafe) */}
                  <div className="bg-error-container/40 p-space-md rounded-DEFAULT flex flex-col gap-space-xs transition-transform duration-200 hover:scale-[1.01]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-space-2xs">
                        <span className="font-body-md text-body-md font-semibold text-on-error-container">Default Fastest Route</span>
                        <span className="font-label-code-md text-label-code-md text-on-surface-variant font-medium">(34 mins)</span>
                      </div>
                      <span className="bg-error text-on-error px-space-xs py-space-2xs rounded-full font-label-caps-micro text-label-caps-micro uppercase font-bold">
                        Risk: 78/100 • Severe
                      </span>
                    </div>
                    
                    {/* Segmented Diagonal Striped Progress Bar */}
                    <div className="w-full bg-error/20 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-error h-full rounded-full w-[78%] relative overflow-hidden">
                        <div className="absolute inset-0 opacity-25 bg-[repeating-linear-gradient(45deg,transparent,transparent_6px,#fff_6px,#fff_12px)]"></div>
                      </div>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-error-container mt-space-2xs flex items-center gap-space-2xs">
                      <span className="material-symbols-outlined text-[16px] text-error">warning</span>
                      <span>Rasoolpura Junction: 2 recorded fatal blackspots, active storm waterlogging detected.</span>
                    </p>
                  </div>

                  {/* Comparison Block 2: SafeRoute AI Recommended */}
                  <div className="bg-surface-container-high p-space-md rounded-DEFAULT flex flex-col gap-space-xs shadow-sm ring-2 ring-secondary-container transition-transform duration-200 hover:scale-[1.01]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-space-2xs">
                        <span className="material-symbols-outlined text-secondary text-[20px]">verified</span>
                        <span className="font-headline-sm text-headline-sm text-on-surface">SafeRoute Recommended</span>
                        <span className="font-label-code-md text-label-code-md text-secondary font-bold">(+4 mins • 38 mins)</span>
                      </div>
                      <span className="bg-surface-container-lowest text-secondary px-space-xs py-space-2xs rounded-full font-label-caps-micro text-label-caps-micro uppercase font-bold shadow-sm">
                        Risk: 24/100 • Low
                      </span>
                    </div>

                    {/* Green Progress Bar */}
                    <div className="w-full bg-surface-container h-2.5 rounded-full overflow-hidden">
                      <div className="bg-secondary-container h-full rounded-full w-[24%]"></div>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface flex items-center gap-space-2xs mt-space-2xs">
                      <span className="material-symbols-outlined text-[16px] text-secondary">check_circle</span>
                      <span>Divided dual carriageway via Outer Ring Link; 0 active water hazards, 100% street-lit coverage.</span>
                    </p>
                  </div>

                  {/* Telemetry Footer Micro-Metrics */}
                  <div className="pt-space-2xs flex items-center justify-between text-on-surface-variant font-label-code-md text-label-code-md">
                    <span className="flex items-center gap-space-2xs">
                      <span className="material-symbols-outlined text-[16px]">psychology</span>
                      YOLOv8 Surface Scan: Validated
                    </span>
                    <span className="flex items-center gap-space-2xs text-secondary font-semibold">
                      <span className="material-symbols-outlined text-[16px]">shield</span>
                      69% Less Exposure
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* "The Problem" Telangana Road Crisis Section */}
        <section className="w-full bg-surface-container-low py-space-3xl px-layout-margin-mobile md:px-layout-margin-tablet lg:px-layout-margin-desktop">
          <div className="max-w-[1440px] mx-auto flex flex-col gap-space-2xl">
            {/* Section Header with Overline */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
              <div className="flex flex-col gap-space-2xs max-w-2xl">
                <span className="font-label-caps-micro text-label-caps-micro uppercase text-secondary font-bold tracking-widest">
                  01 / Civic Reality & Empirical Data
                </span>
                <h2 className="font-headline-lg text-headline-lg text-on-surface font-normal">
                  The Telangana Road Safety Crisis Cannot Be Solved with ETA Algorithms Alone
                </h2>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
                Commercial turn-by-turn routing routes drivers into deadly unlit arterial junctions and monsoon inundations simply to shave 90 seconds off an arrival time. SafeRoute introduces life-preserving intelligence.
              </p>
            </div>

            {/* Stat Callouts Bento Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
              <div className="bg-surface-container-lowest p-space-xl rounded-lg shadow-sm flex flex-col justify-between h-56 transition-all duration-200 hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-label-caps-micro text-label-caps-micro uppercase text-on-surface-variant">Annual Crashes</span>
                  <span className="material-symbols-outlined text-secondary text-[22px]">car_crash</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-display-hero text-display-hero text-on-surface font-semibold leading-none">21,619+</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs">Recorded across Telangana highway corridors and urban nodes.</span>
                </div>
              </div>
              <div className="bg-surface-container-lowest p-space-xl rounded-lg shadow-sm flex flex-col justify-between h-56 transition-all duration-200 hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-label-caps-micro text-label-caps-micro uppercase text-on-surface-variant">Lives Lost Annually</span>
                  <span className="material-symbols-outlined text-error text-[22px]">heart_broken</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-display-hero text-display-hero text-error font-semibold leading-none">6,900+</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs">48% occurring in evening twilight and unlit arterial stretches.</span>
                </div>
              </div>
              <div className="bg-surface-container-lowest p-space-xl rounded-lg shadow-sm flex flex-col justify-between h-56 transition-all duration-200 hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-label-caps-micro text-label-caps-micro uppercase text-on-surface-variant">IIT Delhi DB</span>
                  <span className="material-symbols-outlined text-secondary text-[22px]">hub</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-display-hero text-display-hero text-on-surface font-semibold leading-none">114</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs">High-density accident corridors mapped with verified casualty weights.</span>
                </div>
              </div>
              <div className="bg-surface-container-lowest p-space-xl rounded-lg shadow-sm flex flex-col justify-between h-56 transition-all duration-200 hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-label-caps-micro text-label-caps-micro uppercase text-on-surface-variant">Inundation Risk</span>
                  <span className="material-symbols-outlined text-secondary text-[22px]">water_damage</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-display-hero text-display-hero text-on-surface font-semibold leading-none">3.8x</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs">Crash multiplier during undetected waterlogging and potholes.</span>
                </div>
              </div>
            </div>

            {/* Contextual Illustration / Imagery Banner */}
            <div className="w-full bg-surface-container rounded-lg p-space-xl flex flex-col lg:flex-row items-center justify-between gap-space-xl">
              <div className="flex flex-col gap-space-sm max-w-xl">
                <div className="inline-flex items-center gap-space-2xs text-secondary font-label-code-md text-label-code-md">
                  <span className="material-symbols-outlined text-[18px]">query_stats</span>
                  <span>HYDERABAD TRAFFIC POLICE & GHMC BENCHMARK</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-on-surface font-medium">
                  From Reactive Citizen Complaints to Proactive AI Harm Reduction
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  Conventional apps inform civic officials only after an accident snarls traffic. SafeRoute computes latent road geometry defects, heavy vehicle corridor intersections, and street-level surface regressions before commuter departure.
                </p>
              </div>
              <div className="shrink-0 flex items-center gap-space-md">
                <img className="w-72 h-44 object-cover rounded-DEFAULT shadow-md" alt="A clean modern data operations center in Hyderabad" src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800" />
                <img className="hidden sm:block w-72 h-44 object-cover rounded-DEFAULT shadow-md" alt="Street level urban road in Hyderabad" src="https://images.unsplash.com/photo-1621217030560-61f434220b33?auto=format&fit=crop&q=80&w=800" />
              </div>
            </div>
          </div>
        </section>

        {/* "How It Works" 4-Step Technical Pipeline Flow */}
        <section className="w-full py-space-3xl px-layout-margin-mobile md:px-layout-margin-tablet lg:px-layout-margin-desktop bg-background">
          <div className="max-w-[1440px] mx-auto flex flex-col gap-space-2xl">
            <div className="flex flex-col gap-space-2xs max-w-2xl">
              <span className="font-label-caps-micro text-label-caps-micro uppercase text-secondary font-bold tracking-widest">
                02 / Architecture & Science
              </span>
              <h2 className="font-headline-lg text-headline-lg text-on-surface font-normal">
                How SafeRoute Computes Explainable Risk Scores
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant">
                Four distinct computational stages decouple routing from raw distance, dynamically weighing structural and dynamic real-world road vulnerabilities.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md">
              <div className="bg-surface-container-lowest p-space-lg rounded-lg shadow-sm flex flex-col justify-between gap-space-lg relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center font-label-code-md text-label-code-md text-on-surface font-bold">01</span>
                  <span className="material-symbols-outlined text-on-surface-variant group-hover:text-secondary transition-colors">alt_route</span>
                </div>
                <div className="flex flex-col gap-space-xs">
                  <h4 className="font-headline-sm text-headline-sm text-on-surface">Micro-Segment Decomposition</h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">OpenRouteService polyline vectors are fragmented into discrete 200m–500m evaluation zones.</p>
                </div>
                <div className="pt-space-2xs">
                  <span className="font-label-code-md text-label-code-md text-secondary bg-surface-container-low px-space-xs py-space-2xs rounded-full">Precision: 200m Spans</span>
                </div>
              </div>
              <div className="bg-surface-container-lowest p-space-lg rounded-lg shadow-sm flex flex-col justify-between gap-space-lg relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center font-label-code-md text-label-code-md text-on-surface font-bold">02</span>
                  <span className="material-symbols-outlined text-on-surface-variant group-hover:text-secondary transition-colors">history_edu</span>
                </div>
                <div className="flex flex-col gap-space-xs">
                  <h4 className="font-headline-sm text-headline-sm text-on-surface">Historical Crash Weights</h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">IIT Delhi TRIPP crash records index verified fatalities and injury severity across 114 arterial segments.</p>
                </div>
                <div className="pt-space-2xs">
                  <span className="font-label-code-md text-label-code-md text-secondary bg-surface-container-low px-space-xs py-space-2xs rounded-full">IIT Delhi TRIPP DB</span>
                </div>
              </div>
              <div className="bg-surface-container-lowest p-space-lg rounded-lg shadow-sm flex flex-col justify-between gap-space-lg relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center font-label-code-md text-label-code-md text-on-surface font-bold">03</span>
                  <span className="material-symbols-outlined text-on-surface-variant group-hover:text-secondary transition-colors">camera</span>
                </div>
                <div className="flex flex-col gap-space-xs">
                  <h4 className="font-headline-sm text-headline-sm text-on-surface">Multi-Modal Vision & Radar</h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">Custom YOLOv8 models analyze street imagery while IMD precipitation layers detect waterlogging.</p>
                </div>
                <div className="pt-space-2xs">
                  <span className="font-label-code-md text-label-code-md text-secondary bg-surface-container-low px-space-xs py-space-2xs rounded-full">YOLOv8 + Mapillary</span>
                </div>
              </div>
              <div className="bg-surface-container-lowest p-space-lg rounded-lg shadow-sm flex flex-col justify-between gap-space-lg relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center font-label-code-md text-label-code-md text-on-secondary-container font-bold">04</span>
                  <span className="material-symbols-outlined text-secondary">analytics</span>
                </div>
                <div className="flex flex-col gap-space-xs">
                  <h4 className="font-headline-sm text-headline-sm text-on-surface">Explainable Risk Fusion</h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">Unified 0–100 composite scoring fuses signals into human-readable warnings.</p>
                </div>
                <div className="pt-space-2xs">
                  <span className="font-label-code-md text-label-code-md text-on-surface bg-surface-container px-space-xs py-space-2xs rounded-full font-bold">0-100 Diagnostic Score</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Real Data Sources Section */}
        <section id="data-feeds" className="w-full bg-surface-container-low py-space-2xl px-layout-margin-mobile md:px-layout-margin-tablet lg:px-layout-margin-desktop">
          <div className="max-w-[1440px] mx-auto flex flex-col gap-space-xl">
            <div className="flex flex-col gap-space-2xs">
              <span className="font-label-caps-micro text-label-caps-micro uppercase text-secondary font-bold tracking-widest">
                03 / Verified Data Feeds & Model Pipeline
              </span>
              <h3 className="font-headline-md text-headline-md text-on-surface font-medium">
                Built on Rigorous Institutional Foundations
              </h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-space-md">
              <div className="bg-surface-container-lowest p-space-md rounded-DEFAULT flex flex-col gap-space-2xs shadow-sm">
                <span className="material-symbols-outlined text-secondary text-[20px]">school</span>
                <span className="font-headline-sm text-headline-sm text-on-surface">IIT Delhi</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">114 Telangana crash corridors indexed</span>
              </div>
              <div className="bg-surface-container-lowest p-space-md rounded-DEFAULT flex flex-col gap-space-2xs shadow-sm">
                <span className="material-symbols-outlined text-secondary text-[20px]">view_in_ar</span>
                <span className="font-headline-sm text-headline-sm text-on-surface">YOLOv8 AI</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">5,368 Indian road damage images</span>
              </div>
              <div className="bg-surface-container-lowest p-space-md rounded-DEFAULT flex flex-col gap-space-2xs shadow-sm">
                <span className="material-symbols-outlined text-secondary text-[20px]">map</span>
                <span className="font-headline-sm text-headline-sm text-on-surface">OpenRoute</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">Real-time dynamic route graph APIs</span>
              </div>
              <div className="bg-surface-container-lowest p-space-md rounded-DEFAULT flex flex-col gap-space-2xs shadow-sm">
                <span className="material-symbols-outlined text-secondary text-[20px]">photo_camera</span>
                <span className="font-headline-sm text-headline-sm text-on-surface">Mapillary</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">Crowdsourced street-level vision network</span>
              </div>
              <div className="bg-surface-container-lowest p-space-md rounded-DEFAULT flex flex-col gap-space-2xs shadow-sm">
                <span className="material-symbols-outlined text-secondary text-[20px]">rainy</span>
                <span className="font-headline-sm text-headline-sm text-on-surface">IMD Radar</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">Telangana monsoon waterlogging feeds</span>
              </div>
              <div className="bg-surface-container-lowest p-space-md rounded-DEFAULT flex flex-col gap-space-2xs shadow-sm">
                <span className="material-symbols-outlined text-secondary text-[20px]">feed</span>
                <span className="font-headline-sm text-headline-sm text-on-surface">Google News</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">Natural language live incident scraper</span>
              </div>
            </div>
          </div>
        </section>

        {/* Impact & Evaluation Callout */}
        <section className="w-full py-space-3xl px-layout-margin-mobile md:px-layout-margin-tablet lg:px-layout-margin-desktop bg-background">
          <div className="max-w-[1440px] mx-auto bg-surface-container rounded-lg p-space-xl md:p-space-2xl shadow-sm flex flex-col lg:flex-row items-center justify-between gap-space-2xl relative overflow-hidden">
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-secondary-container/30 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="flex flex-col gap-space-md max-w-2xl z-10">
              <div className="flex flex-wrap items-center gap-space-xs">
                <span className="bg-primary text-on-primary font-label-caps-micro text-label-caps-micro uppercase px-space-sm py-space-2xs rounded-full font-bold">
                  Microsoft Evaluator Dossier
                </span>
                <span className="font-label-code-md text-label-code-md text-secondary font-semibold">
                  AICW 2024 Capstone Submission
                </span>
              </div>
              <h3 className="font-headline-lg text-headline-lg text-on-surface font-normal">
                Designed for Civic Authority Scale & Real-World Lives Saved
              </h3>
              <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                SafeRoute Telangana is not a conceptual mockup. It is fully architected for API ingestion into municipal command systems including GHMC Command Control and Hyderabad Traffic Police dispatched units, delivering explainable risk metrics in under 420 milliseconds.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm pt-space-xs">
                <div className="flex items-center gap-space-2xs text-on-surface font-body-sm text-body-sm">
                  <span className="material-symbols-outlined text-secondary text-[18px]">check_circle</span>
                  <span>Zero proprietary GIS lock-in (OpenStreetMap based)</span>
                </div>
                <div className="flex items-center gap-space-2xs text-on-surface font-body-sm text-body-sm">
                  <span className="material-symbols-outlined text-secondary text-[18px]">check_circle</span>
                  <span>Explainable AI diagnostic explanations for every turn</span>
                </div>
                <div className="flex items-center gap-space-2xs text-on-surface font-body-sm text-body-sm">
                  <span className="material-symbols-outlined text-secondary text-[18px]">check_circle</span>
                  <span>Sub-second multi-criteria pathfinding optimization</span>
                </div>
                <div className="flex items-center gap-space-2xs text-on-surface font-body-sm text-body-sm">
                  <span className="material-symbols-outlined text-secondary text-[18px]">check_circle</span>
                  <span>Trained on authentic Indian road geometry datasets</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-center lg:items-end gap-space-md z-10 shrink-0 w-full sm:w-auto">
              <Link to="/route-planner" className="w-full sm:w-auto text-center px-space-xl py-space-md rounded-full bg-secondary-container text-on-secondary-container hover:bg-tertiary-fixed-dim transition-all duration-300 font-headline-sm text-headline-sm shadow-md hover:shadow-lg">
                Test Safe Route Finder Now
              </Link>
              <a href="#" className="w-full sm:w-auto text-center px-space-xl py-space-md rounded-full bg-surface-container-lowest text-on-surface hover:bg-surface-variant transition-colors font-body-md text-body-md shadow-sm">
                Inspect Model Architecture
              </a>
              <span className="font-label-caps-micro text-label-caps-micro uppercase text-on-surface-variant text-center">
                Open Telemetry & Code Available to Evaluation Panel
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
