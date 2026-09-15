import { CircleMarker, MapContainer, Polyline, Popup, TileLayer } from "react-leaflet";
import type { LatLngBoundsExpression, LatLngTuple } from "leaflet";
import type { RouteSegment } from "../types/route";

interface Props {
  segments: RouteSegment[];
  alternateSegments?: RouteSegment[] | null;
  drivePosition?: LatLngTuple | null;
  onSegmentSelect?: (segment: RouteSegment) => void;
}

const riskColor = (score: number) =>
  score >= 75 ? "#B93535" : score >= 50 ? "#D36128" : score >= 30 ? "#D99B26" : "#2E7D5B";

export const buildRouteGeometry = (segments: RouteSegment[]): LatLngTuple[] =>
  segments.flatMap((segment) => segment.coordinates as LatLngTuple[]).filter(
    (point, index, points) => index === 0 || point[0] !== points[index - 1][0] || point[1] !== points[index - 1][1],
  );

function SegmentPopup({ segment, onSelect }: { segment: RouteSegment; onSelect?: (segment: RouteSegment) => void }) {
  const weather = segment.weather_status === "unavailable"
    ? "Weather feed unavailable"
    : segment.weather_modifier >= 20 ? "Live weather: severe caution"
      : segment.weather_modifier >= 10 ? "Live weather: caution active"
        : `Live weather: clear · no score lift${segment.weather_precipitation_mm !== undefined ? ` (${segment.weather_precipitation_mm} mm/h)` : ""}`;
  const traffic = segment.traffic_status === "unavailable" || segment.traffic_level === "unavailable"
    ? "Traffic feed unavailable"
    : `Live traffic: ${segment.traffic_level}${segment.traffic_current_speed_kmh !== undefined ? ` (${segment.traffic_current_speed_kmh} km/h)` : ""}`;
  const hazard = segment.waterlogging_flag ? "Waterlogging flag" : segment.news_flags?.[0] ?? "No incident headline";
  return <div className="min-w-52 max-w-64 space-y-2 py-1">
    <div className="flex items-center justify-between gap-3"><b>{segment.road_name}</b><span style={{ color: riskColor(segment.final_score) }}>{segment.final_score}/100</span></div>
    <p className="m-0 text-xs">{weather}</p>
    <p className="m-0 text-xs">{traffic}</p>
    <p className="m-0 text-xs"><b>Surface:</b> {segment.vision_severity}</p>
    <p className="m-0 text-xs"><b>Advisory:</b> {hazard}</p>
    {segment.image_url && <img src={segment.image_url} alt={"Road surface at " + segment.road_name} className="max-h-28 w-full rounded object-contain bg-[#f1efe9]" />}
    {onSelect && <button type="button" onClick={() => onSelect(segment)} className="rounded bg-[#1A1A18] px-2 py-1 text-xs text-white">Open full breakdown</button>}
  </div>;
}

export default function RouteMap({ segments, alternateSegments, drivePosition, onSegmentSelect }: Props) {
  const primaryPoints = buildRouteGeometry(segments);
  const alternatePoints = buildRouteGeometry(alternateSegments ?? []);
  const allPoints = [...primaryPoints, ...alternatePoints];
  const bounds: LatLngBoundsExpression | undefined = allPoints.length ? allPoints : undefined;

  return <MapContainer bounds={bounds} center={bounds ? undefined : [17.385, 78.4867]} zoom={bounds ? undefined : 12} style={{ height: "100%", width: "100%" }}>
    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
    {alternatePoints.length > 1 && <Polyline positions={alternatePoints} pathOptions={{ color: "#557A65", weight: 4, opacity: 0.45, dashArray: "10 8" }} />}
    {primaryPoints.length > 1 && <Polyline positions={primaryPoints} pathOptions={{ color: "#D4A234", weight: 8, opacity: 0.92 }} />}
    {segments.map((segment) => <CircleMarker key={segment.segment_id} center={[segment.midpoint.lat, segment.midpoint.lng]} radius={8} pathOptions={{ color: "#fff", weight: 2, fillColor: riskColor(segment.final_score), fillOpacity: 1 }}>
      <Popup><SegmentPopup segment={segment} onSelect={onSegmentSelect} /></Popup>
    </CircleMarker>)}
    {drivePosition && <CircleMarker center={drivePosition} radius={10} pathOptions={{ color: "#1A1A18", weight: 3, fillColor: "#FFFFFF", fillOpacity: 1 }}><Popup>Simulated vehicle position</Popup></CircleMarker>}
  </MapContainer>;
}
