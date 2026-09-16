//frontend/src/types/route.ts
export type TrafficLevel = "low" | "medium" | "high" | "severe" | "unavailable";
export type VisionSeverity = "none" | "minor" | "moderate" | "severe";
export type ImageSource = "mapillary" | "rdd2022_sample" | "no_image_available";

export interface Coordinate {
  lat: number;
  lng: number;
}

export interface RouteSegment {
  segment_id: string;
  coordinates: [number, number][]; // [lat, lng]
  midpoint: Coordinate;
  road_name: string;
  historical_score: number;
  time_pattern_modifier: number;
  weather_modifier: number;
  weather_status?: "live" | "unavailable";
  weather_precipitation_mm?: number;
  weather_wind_kmh?: number;
  weather_visibility_m?: number | null;
  traffic_level: TrafficLevel;
  traffic_status?: "live" | "unavailable";
  traffic_current_speed_kmh?: number;
  traffic_free_flow_speed_kmh?: number;
  traffic_flow_ratio?: number;
  waterlogging_flag: boolean;
  vision_severity: VisionSeverity;
  vision_source: ImageSource;
  image_url: string | null;
  news_flags: string[] | null;
  news_risk_score?: number;
  final_score: number;
  explanation: string;
}

export interface RouteRiskResponse {
  route_total_risk: number;
  segments: RouteSegment[];
}

export interface AlternateRouteResponse {
  alternate_available: boolean;
  reason?: string;
  recommendation?: string;
  should_suggest_alternate?: boolean;
  primary_risk?: number;
  alternate_risk?: number;
  extra_time_minutes?: number;
  primary_segments?: RouteSegment[];
  alternate_segments?: RouteSegment[] | null;
}

export type RiskCategory = "low" | "moderate" | "high" | "severe";

export interface SafetySnapshot {
  id: string;
  checkedAt: string;
  route: RouteRiskResponse;
  riskCategory: RiskCategory;
  activeSignals: number;
  highestRiskSegmentId: string | null;
  weatherState: "clear" | "caution" | "unavailable";
  trafficState: TrafficLevel | "mixed";
  waterloggingActive: boolean;
  newsCount: number;
  visionDetections: number;
}

export interface SavedCommute {
  id: string;
  name: string;
  origin: string;
  destination: string;
  favorite: boolean;
  recurring: boolean;
  createdAt: string;
  snapshots: SafetySnapshot[];
}