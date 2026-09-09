import { Link, NavLink } from "react-router-dom";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-20 w-full max-w-[1800px] mx-auto px-layout-margin-mobile md:px-layout-margin-tablet lg:px-layout-margin-desktop flex items-center justify-between gap-space-md">
        
        {/* Brand */}
        <div className="flex items-center gap-space-md shrink-0">
          <img alt="SafeRoute Telangana Brand Logo" className="h-8 w-auto object-contain" src="/logo.png" />
          <div className="flex flex-col">
            <div className="flex items-center gap-space-xs">
              <span className="font-headline-sm text-headline-sm text-on-surface">SafeRoute Telangana</span>
              <span className="bg-surface-container-high text-on-surface-variant font-label-caps-micro text-label-caps-micro uppercase px-space-xs py-space-2xs rounded-full">AICW • Microsoft Capstone</span>
            </div>
            <div className="hidden xl:flex items-center gap-space-xs mt-space-2xs">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-secondary"></span>
              <span className="font-label-caps-micro text-label-caps-micro uppercase text-secondary">Live Feeds Active • Hyderabad Metros • IIT-Delhi Crash DB Synced</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden lg:flex items-center gap-space-xs bg-surface-container-low p-space-2xs rounded-full shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
          <NavLink to="/" className={({ isActive }) => `whitespace-nowrap px-space-md py-space-xs font-body-sm transition-colors rounded-full ${isActive ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'}`}>Overview</NavLink>
          <NavLink to="/route-planner" className={({ isActive }) => `whitespace-nowrap px-space-md py-space-xs font-body-sm transition-colors rounded-full ${isActive ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'}`}>Safe Route Finder</NavLink>
          <NavLink to="/route" className={({ isActive }) => `whitespace-nowrap px-space-md py-space-xs font-body-sm transition-colors rounded-full ${isActive ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'}`}>Live Safety Map &amp; Results</NavLink>
          <Link to="/#data-feeds" className="whitespace-nowrap px-space-md py-space-xs rounded-full font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">Analytics Heatmap</Link>
          <Link to="/about" className="whitespace-nowrap px-space-md py-space-xs rounded-full font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">System Methodology</Link>
          <a href="#site-footer" className="whitespace-nowrap px-space-md py-space-xs rounded-full font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">Team</a>
        </nav>

        {/* Actions & Profile */}
        <div className="flex items-center gap-space-sm shrink-0">
          <NavLink to="/route-planner" className="hidden sm:inline-flex items-center gap-space-xs px-space-lg py-space-xs rounded-full bg-secondary-container text-on-secondary-container hover:bg-tertiary-fixed-dim transition-colors font-body-md text-body-md font-semibold shadow-[0_2px_8px_rgba(253,199,86,0.25)]">
            <span className="material-symbols-outlined text-[18px]">navigation</span>Launch Safe Route
          </NavLink>
          <div className="flex items-center gap-space-xs pl-space-xs">
            <div className="w-8 h-8 rounded-full bg-surface-variant ring-1 ring-surface-variant flex items-center justify-center text-xs font-bold text-on-surface-variant">PR</div>
            <div className="hidden 2xl:flex flex-col text-left">
              <span className="font-body-sm text-body-sm font-semibold text-on-surface">Dr. Priya Rao</span>
              <span className="font-label-caps-micro text-label-caps-micro uppercase text-on-surface-variant">Lead AI Engineer</span>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
};

export default Header;
