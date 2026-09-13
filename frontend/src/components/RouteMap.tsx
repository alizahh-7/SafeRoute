//frontend/src/components/RouteMap.tsx
import { MapContainer, TileLayer, Polyline, Popup } from "react-leaflet";
import type { LatLngBoundsExpression, LatLngTuple } from "leaflet";
import type { RouteSegment } from "../types/route";

interface Props {
  segments: RouteSegment[];
  alternate?: boolean;
}

const riskColor = (score: number) =>
  score >= 75 ? "#B93535" : score >= 50 ? "#D36128" : score >= 30 ? "#D99B26" : "#2E7D5B";

const RouteMap = ({ segments }: Props) => {
  const allPoints: LatLngTuple[] = segments.flatMap((s) => s.coordinates as LatLngTuple[]);

  const bounds: LatLngBoundsExpression | undefined =
    allPoints.length > 0 ? allPoints : undefined;

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
        <Polyline
          key={seg.segment_id}
          positions={seg.coordinates as LatLngTuple[]}
          pathOptions={{ color: riskColor(seg.final_score), weight: 6, opacity: 0.85 }}
        >
          <Popup>
            <b>{seg.road_name}</b> ({seg.final_score}/100)
            <br />
            {seg.explanation}
          </Popup>
        </Polyline>
      ))}
    </MapContainer>
  );
};

export default RouteMap;