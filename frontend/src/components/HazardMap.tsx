import { CircleMarker, MapContainer, Polyline, TileLayer, useMap } from "react-leaflet";
import { useEffect } from "react";
import type { LatLngTuple } from "leaflet";
import type { RouteSegment } from "../types/route";
import { buildRouteGeometry } from "./RouteMap";

function FollowVehicle({ position }: { position: LatLngTuple | null }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.panTo(position, {
        animate: true,
        duration: 0.4,
      });
    }
  }, [position, map]);

  return null;
}

interface Props {
  routeSegments: RouteSegment[];
  hazardSegment: RouteSegment;
  alternateSegments?: RouteSegment[] | null;
  rerouted?: boolean;
  vehiclePosition?: LatLngTuple | null;
}

export default function HazardMap({
  routeSegments,
  hazardSegment,
  alternateSegments,
  rerouted,
  vehiclePosition,
}: Props) {
  const primaryPoints = buildRouteGeometry(routeSegments);
  const alternatePoints = buildRouteGeometry(alternateSegments ?? []);

  const center: LatLngTuple = [
    hazardSegment.midpoint.lat,
    hazardSegment.midpoint.lng,
  ];

  return (
    <MapContainer
      center={center}
      zoom={17}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      <FollowVehicle position={vehiclePosition ?? null} />

      {primaryPoints.length > 1 && (
        <Polyline
          positions={primaryPoints}
          pathOptions={{
            color: rerouted ? "#9AA39A" : "#D4A234",
            weight: 5,
            opacity: rerouted ? 0.35 : 0.85,
          }}
        />
      )}

      {alternatePoints.length > 1 && (
        <Polyline
          positions={alternatePoints}
          pathOptions={{
            color: "#2E7D5B",
            weight: rerouted ? 8 : 5,
            opacity: rerouted ? 0.95 : 0.55,
            dashArray: rerouted ? undefined : "10 8",
          }}
        />
      )}

      {!rerouted && (
        <>
          <CircleMarker
            center={[
              hazardSegment.midpoint.lat,
              hazardSegment.midpoint.lng,
            ]}
            radius={22}
            pathOptions={{
              color: "#B93535",
              weight: 2,
              fillColor: "#B93535",
              fillOpacity: 0.15,
            }}
          />

          <CircleMarker
            center={[
              hazardSegment.midpoint.lat,
              hazardSegment.midpoint.lng,
            ]}
            radius={10}
            pathOptions={{
              color: "#fff",
              weight: 2,
              fillColor: "#B93535",
              fillOpacity: 1,
            }}
          />
        </>
      )}

      {vehiclePosition && (
        <CircleMarker
          center={vehiclePosition}
          radius={9}
          pathOptions={{
            color: "#1A1A18",
            weight: 3,
            fillColor: "#FFFFFF",
            fillOpacity: 1,
          }}
        />
      )}
    </MapContainer>
  );
}
