import { AlertTriangle, Route, RouteIcon } from "lucide-react";
import { useRouteContext } from "../context/RouteContext";

const SessionStatsBar = () => {
  const { routesAnalyzed, hazardsFlagged, reroutesAccepted } = useRouteContext();
  const stats = [
    { label: "Routes analyzed", value: routesAnalyzed, icon: Route, accent: "text-secondary" },
    { label: "Hazards flagged", value: hazardsFlagged, icon: AlertTriangle, accent: "text-error" },
    { label: "Reroutes accepted", value: reroutesAccepted, icon: RouteIcon, accent: "text-secondary" },
  ];

  return (
    <section aria-label="This session's SafeRoute activity" className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm w-full max-w-2xl">
      {stats.map(({ label, value, icon: Icon, accent }) => (
        <div key={label} className="rounded-DEFAULT bg-surface-container-lowest px-space-md py-space-sm shadow-sm border border-outline-variant/20 flex items-center gap-space-sm">
          <span className={`grid place-items-center size-9 rounded-full bg-surface-container-low ${accent}`}>
            <Icon size={17} aria-hidden="true" />
          </span>
          <div>
            <p className="font-label-caps-micro text-label-caps-micro uppercase text-on-surface-variant">{label}</p>
            <p className="font-headline-md text-headline-md text-on-surface font-semibold leading-tight">{value}</p>
          </div>
        </div>
      ))}
    </section>
  );
};

export default SessionStatsBar;
