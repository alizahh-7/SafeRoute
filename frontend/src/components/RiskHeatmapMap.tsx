import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import type { LatLngBoundsExpression, LatLngTuple } from "leaflet";
import type { RouteSegment } from "../types/route";

interface Props {
  segments: RouteSegment[];
}

const color = (score: number) =>
  score >= 75 ? "#B93535" : score >= 50 ? "#D36128" : score >= 30 ? "#D99B26" : "#2E7D5B";

export default function RiskHeatmapMap({ segments }: Props) {
  const points: LatLngTuple[] = segments.map((s) => [s.midpoint.lat, s.midpoint.lng]);
  const bounds: LatLngBoundsExpression | undefined = points.length > 0 ? points : undefined;

  return (
    <MapContainer
      bounds={bounds}
      center={bounds ? undefined : [17.385, 78.4867]}
      zoom={bounds ? undefined : 12}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      {segments.map((seg) => (
        <CircleMarker
          key={seg.segment_id}
          center={[seg.midpoint.lat, seg.midpoint.lng]}
          radius={9}
          pathOptions={{ color: "white", weight: 2, fillColor: color(seg.final_score), fillOpacity: 0.9 }}
        >
          <Popup>
            <b>{seg.road_name}</b> ({seg.final_score}/100)
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}