//frontend/src/types/route.ts
export type TrafficLevel = "low" | "medium" | "high" | "severe";
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
  traffic_level: TrafficLevel;
  waterlogging_flag: boolean;
  vision_severity: VisionSeverity;
  vision_source: ImageSource;
  image_url: string | null;
  news_flags: string[] | null;
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
  should_suggest_alternate?: boolean;
  primary_risk?: number;
  alternate_risk?: number;
  extra_time_minutes?: number;
  primary_segments?: RouteSegment[];
  alternate_segments?: RouteSegment[] | null;
}