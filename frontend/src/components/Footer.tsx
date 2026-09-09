import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer id="site-footer" className="w-full bg-surface-container-low py-space-2xl text-on-surface-variant shadow-[0_-1px_6px_rgba(0,0,0,0.02)]">
      <div className="w-full max-w-[1440px] mx-auto px-layout-margin-mobile md:px-layout-margin-tablet lg:px-layout-margin-desktop">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-space-xl pb-space-xl">
          <div className="max-w-2xl">
            <div className="flex items-center gap-space-xs mb-space-xs">
              <span className="font-headline-sm text-headline-sm text-on-surface">SafeRoute Telangana</span>
              <span className="font-label-code-md text-label-code-md px-space-xs py-space-2xs bg-surface-container rounded-full text-on-surface-variant uppercase">
                v2.4 LTS
              </span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              SafeRoute Telangana is an AI-powered civic mobility safety intelligence system developed under the AI Careers for Women (AICW) Capstone Program, supported by Microsoft. Dedicated to proactive harm reduction across Telangana arterial highways and metropolitan clusters.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-space-xl">
            <div className="flex flex-col gap-space-sm">
              <span className="font-label-caps-micro text-label-caps-micro uppercase text-on-surface tracking-wider">Platform Modules</span>
              <Link to="/" className="font-body-sm text-body-sm hover:text-on-surface transition-colors">Executive Overview</Link>
              <Link to="/route-planner" className="font-body-sm text-body-sm hover:text-on-surface transition-colors">Multi-Criteria Router</Link>
              <Link to="/route" className="font-body-sm text-body-sm hover:text-on-surface transition-colors">Live Corridors &amp; HUD</Link>
              <Link to="/#data-feeds" className="font-body-sm text-body-sm hover:text-on-surface transition-colors">Blackspot Density Map</Link>
            </div>
            <div className="flex flex-col gap-space-sm">
              <span className="font-label-caps-micro text-label-caps-micro uppercase text-on-surface tracking-wider">Institutional Research</span>
              <Link to="/about" className="font-body-sm text-body-sm hover:text-on-surface transition-colors">Model Architecture</Link>
              <a href="#site-footer" className="font-body-sm text-body-sm hover:text-on-surface transition-colors">Capstone Investigators</a>
              <span className="font-body-sm text-body-sm text-outline-variant">AICW Cohort 2024</span>
            </div>
          </div>
        </div>
        <div className="pt-space-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md text-on-surface-variant bg-surface-container rounded-lg p-space-md">
          <div className="flex flex-wrap items-center gap-x-space-md gap-y-space-2xs font-label-code-md text-label-code-md">
            <span className="font-label-caps-micro text-label-caps-micro uppercase text-on-surface">Data Attributions:</span>
            <span>OpenRouteService</span><span>•</span><span>IIT Delhi Crash Dataset (Telangana 114 Corridors)</span><span>•</span><span>YOLOv8 on RDD2022 India (5,368 training images)</span><span>•</span><span>Mapillary Street Imagery API</span><span>•</span><span>Google News Real-time Alert Feeds</span>
          </div>
          <div className="font-body-sm text-body-sm text-outline shrink-0">© 2025 SafeRoute Telangana. All rights reserved.</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
