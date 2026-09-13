import { MapPin, Navigation, Car, Bike, Bus, Ambulance, Star, ShieldCheck, Cpu, AlertTriangle, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useRouteContext } from "../context/RouteContext";
import { reverseGeocodeLocation, fetchCityNews } from "../services/api";
import LocationAutocomplete from "../components/LocationAutocomplete";

const vehicleModes = [
  { id: "four-wheeler", label: "Four-Wheeler", icon: Car },
  { id: "two-wheeler", label: "Two-Wheeler", icon: Bike },
  { id: "auto", label: "Auto", icon: Bus },
  { id: "emergency", label: "Emergency", icon: Ambulance },
] as const;

const quickPicks = [
  ["HITEC City, Hyderabad", "Begumpet, Hyderabad"],
  ["Banjara Hills, Hyderabad", "Charminar, Hyderabad"],
  ["Financial District, Hyderabad", "Shamshabad Airport, Hyderabad"],
  ["Kukatpally, Hyderabad", "Ameerpet, Hyderabad"],
];

const cleanLocation = (value: string) => value.replace(/\s+/g, " ").trim();

const RoutePlanner = () => {
  const navigate = useNavigate();
  const { planRoute, loading, error } = useRouteContext();
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [vehicleMode, setVehicleMode] = useState<string>("four-wheeler");
  const [locatingUser, setLocatingUser] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [cityNews, setCityNews] = useState<string[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);

  useEffect(() => {
    fetchCityNews().then(setCityNews).finally(() => setNewsLoading(false));
  }, []);

  const handleAnalyze = async () => {
    const cleanOrigin = cleanLocation(origin);
    const cleanDestination = cleanLocation(destination);
    if (!cleanOrigin || !cleanDestination) return;
    setOrigin(cleanOrigin);
    setDestination(cleanDestination);
    await planRoute(cleanOrigin, cleanDestination);
    navigate("/route");
  };

  const handleQuickPick = async (o: string, d: string) => {
    const cleanOrigin = cleanLocation(o);
    const cleanDestination = cleanLocation(d);
    setOrigin(cleanOrigin);
    setDestination(cleanDestination);
    await planRoute(cleanOrigin, cleanDestination);
    navigate("/route");
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Your browser doesn't support location access.");
      return;
    }
    setLocatingUser(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const label = await reverseGeocodeLocation(pos.coords.latitude, pos.coords.longitude);
          setOrigin(label);
        } catch {
          setLocationError("Found your location, but couldn't name it. Try typing it manually.");
        } finally {
          setLocatingUser(false);
        }
      },
      () => {
        setLocationError("Location access denied — enable it in your browser settings, or type your location.");
        setLocatingUser(false);
      }
    );
  };

  return (
    <div className="w-full pt-20 bg-background min-h-screen pb-space-3xl">
      <div className="max-w-[1440px] mx-auto px-layout-margin-mobile md:px-layout-margin-tablet lg:px-layout-margin-desktop pt-space-xl">

        <div className="flex gap-space-2xs items-center mb-space-md font-label-caps-micro text-label-caps-micro uppercase text-on-surface-variant">
          <span className="flex items-center gap-space-2xs text-secondary font-bold">
            <Zap size={14} className="text-secondary" /> AI MOBILITY GUIDANCE
          </span>
        </div>

        <h1 className="font-display-hero text-display-hero text-on-surface tracking-tight font-medium max-w-2xl mb-space-xl">
          Plan a Safer Commute across <br/><span className="text-secondary">Telangana</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg mb-space-3xl">

          {/* Planner Card */}
          <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl p-space-xl shadow-sm border border-surface-variant flex flex-col">
            <div className="flex justify-between items-start mb-space-lg flex-wrap gap-space-md">
              <div className="flex flex-col gap-space-2xs">
                <div className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-space-xs">
                  <ShieldCheck size={20} className="text-secondary" /> Multi-Criteria Safe Corridors
                </div>
                <div className="font-body-sm text-body-sm text-on-surface-variant">Real historical crash data, live weather, live traffic, and road-surface vision — fused into one score.</div>
              </div>
              <div className="flex p-1 bg-surface-container-low border border-surface-variant rounded-full font-label-code-md text-label-code-md text-on-surface-variant">
                {vehicleModes.map(({ id, label, icon: Icon }) => (
                  <button key={id} onClick={() => setVehicleMode(id)}
                    className={`py-space-2xs px-space-sm rounded-full flex items-center gap-space-2xs transition-colors ${vehicleMode === id ? "bg-on-surface text-surface font-semibold shadow-sm" : "hover:text-on-surface"}`}>
                    <Icon size={16}/> {label}
                  </button>
                ))}
              </div>
            </div>

            {vehicleMode !== "four-wheeler" && (
              <p className="font-body-sm text-on-surface-variant mb-space-md -mt-space-sm">
                Note: risk scoring is currently the same across vehicle types — mode-specific weighting isn't built yet.
              </p>
            )}

            {/* Inputs with real autocomplete */}
            <div className="bg-surface-container-low border border-surface-variant rounded-xl p-space-md mb-space-lg">
              <div className="flex gap-space-sm items-center mb-space-sm">
                <div className="w-10 h-10 rounded-full bg-surface-container-lowest border border-surface-variant flex items-center justify-center shrink-0 text-on-surface-variant"><MapPin size={18}/></div>
                <LocationAutocomplete value={origin} onChange={setOrigin} placeholder="Starting point" />
                <button onClick={handleUseCurrentLocation} disabled={locatingUser}
                  className="bg-surface-container text-on-surface px-space-md py-space-sm rounded-full font-label-code-md text-label-code-md flex items-center gap-space-2xs hover:bg-surface-variant transition-colors disabled:opacity-50 shrink-0">
                  <Navigation size={14}/> {locatingUser ? "Locating..." : "Current Location"}
                </button>
              </div>
              <div className="flex gap-space-sm items-center">
                <div className="w-10 h-10 rounded-full bg-surface-container-lowest border border-surface-variant flex items-center justify-center shrink-0 text-error"><MapPin size={18}/></div>
                <LocationAutocomplete value={destination} onChange={setDestination} placeholder="Destination" />
              </div>
              {locationError && <p className="font-body-sm text-error mt-space-sm">{locationError}</p>}
            </div>

            <button onClick={handleAnalyze} disabled={loading || !origin.trim() || !destination.trim()}
              className="w-full bg-on-surface text-surface py-space-md rounded-full font-headline-sm text-headline-sm flex items-center justify-center gap-space-sm hover:bg-on-surface-variant transition-colors shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50">
              <Navigation size={20} /> {loading ? "Analyzing real route data..." : "Analyze Corridor Safety & Fetch Routes"}
            </button>
            {error && <p className="text-error font-body-sm mt-space-sm">{error}</p>}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 flex flex-col gap-space-lg">
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-surface-variant flex flex-col h-full">
              <div className="flex justify-between items-start mb-space-lg">
                <span className="font-label-caps-micro uppercase text-on-surface-variant font-bold">About this scoring</span>
              </div>
              <p className="font-body-sm text-on-surface-variant">Every score combines real Telangana crash data, live weather (Open-Meteo), live traffic (TomTom), road-surface vision (YOLOv8), and local news — no simulated numbers.</p>
              <div className="mt-auto bg-surface-container-low border border-surface-variant p-space-sm rounded-lg flex items-center justify-between font-label-code-md text-label-code-md text-on-surface-variant cursor-pointer hover:bg-surface-container transition-colors" onClick={() => navigate("/methodology")}>
                <span className="flex items-center gap-space-2xs"><Cpu size={16} className="text-secondary"/> Read the full methodology</span>
                <Navigation size={14} className="rotate-45" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick picks — real, clickable, no fake scores shown until actually computed */}
        <h3 className="font-headline-lg text-headline-lg text-on-surface mb-space-md">Try a Popular Hyderabad Corridor</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-space-md mb-space-3xl">
          {quickPicks.map(([o, d]) => (
            <button key={o + d} type="button" onClick={() => handleQuickPick(o, d)} disabled={loading}
              className="text-left bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-surface-variant hover:shadow-md hover:-translate-y-0.5 transition-all disabled:opacity-50">
              <h4 className="font-headline-sm text-headline-sm text-on-surface leading-snug">{o.split(",")[0]} → {d.split(",")[0]}</h4>
              <p className="font-body-sm text-on-surface-variant mt-space-sm">Tap to run a real, live risk analysis on this route.</p>
            </button>
          ))}
        </div>

        {/* Real Hyderabad news feed, not fabricated */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg pb-space-2xl">
          <div className="lg:col-span-4 bg-surface-container-lowest rounded-xl p-space-xl shadow-sm border border-surface-variant flex flex-col items-center justify-center text-center">
            <Star size={32} className="text-on-surface-variant opacity-50 mb-space-md" />
            <h4 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs">Saved Commutes</h4>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-lg max-w-[240px]">View and manage routes you've already analyzed.</p>
            <button onClick={() => navigate('/saved-corridors')} className="bg-surface-container-low border border-surface-variant text-on-surface px-space-lg py-space-sm rounded-full font-label-code-md text-label-code-md font-semibold hover:bg-surface-container transition-colors shadow-sm">
              Go to Saved Corridors
            </button>
          </div>

          <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl p-space-xl shadow-sm border border-surface-variant flex flex-col">
            <div className="flex flex-wrap justify-between items-center mb-space-lg border-b border-surface-variant pb-space-sm gap-space-md">
              <div className="flex items-center gap-space-2xs font-label-caps-micro text-label-caps-micro uppercase font-bold">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span> Live Hyderabad News (Google News RSS)
              </div>
            </div>
            {newsLoading ? (
              <p className="font-body-sm text-on-surface-variant">Checking for recent local reports...</p>
            ) : cityNews.length > 0 ? (
              <div className="flex flex-col gap-space-sm">
                {cityNews.slice(0, 4).map((headline, i) => (
                  <div key={i} className="flex gap-space-md p-space-md border border-surface-variant bg-surface-container-low rounded-xl">
                    <AlertTriangle size={18} className="text-secondary shrink-0 mt-1" />
                    <p className="font-body-sm">{headline}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="font-body-sm text-on-surface-variant">No relevant local traffic/hazard news found right now — that's a good sign, not a missing feature.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoutePlanner;
