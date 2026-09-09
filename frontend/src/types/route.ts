export type TrafficLevel = "low" | "medium" | "high" | "severe";
export type VisionSeverity = "none" | "minor" | "moderate" | "severe";
export type ImageSource = "site" | "rdd2022_sample" | null;

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
  news_flags: string[] | null;
  final_score: number;
  explanation: string;
  image_url: string | null;
  image_source: ImageSource;
}
