import type { RouteSegment } from "../types/route";

const mockSegments: RouteSegment[] = [
  {
    segment_id: "7e60db33",
    coordinates: [[17.4116, 78.4550], [17.4125, 78.4561]],
    midpoint: { lat: 17.4120, lng: 78.4555 },
    road_name: "Khairatabad Flyover",
    historical_score: 15,
    time_pattern_modifier: 1.0,
    weather_modifier: 0,
    traffic_level: "low",
    waterlogging_flag: false,
    vision_severity: "none",
    news_flags: null,
    final_score: 15,
    explanation: "Clear road, low historical risk.",
    image_url: null,
    image_source: null
  },
  {
    segment_id: "8f71ec44",
    coordinates: [[17.4125, 78.4561], [17.4150, 78.4600]],
    midpoint: { lat: 17.4137, lng: 78.4580 },
    road_name: "Tank Bund Road",
    historical_score: 25,
    time_pattern_modifier: 1.1,
    weather_modifier: 10,
    traffic_level: "medium",
    waterlogging_flag: true,
    vision_severity: "minor",
    news_flags: ["Mild waterlogging reported near Tank Bund"],
    final_score: 42,
    explanation: "Elevated risk due to mild waterlogging and moderate traffic.",
    image_url: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=400",
    image_source: "rdd2022_sample"
  },
  {
    segment_id: "9a82fd55",
    coordinates: [[17.4150, 78.4600], [17.4200, 78.4650]],
    midpoint: { lat: 17.4175, lng: 78.4625 },
    road_name: "NH65",
    historical_score: 60,
    time_pattern_modifier: 1.3,
    weather_modifier: 0,
    traffic_level: "high",
    waterlogging_flag: false,
    vision_severity: "severe",
    news_flags: ["Major pothole causing delays on NH65", "Accident cleared on NH65"],
    final_score: 85,
    explanation: "Severe road damage detected. High historical crash rate.",
    image_url: "https://images.unsplash.com/photo-1518174542385-b9f0ed23fb39?auto=format&fit=crop&q=80&w=400",
    image_source: "site"
  },
  {
    segment_id: "0b93ae66",
    coordinates: [[17.4200, 78.4650], [17.4250, 78.4700]],
    midpoint: { lat: 17.4225, lng: 78.4675 },
    road_name: "Punjagutta Junction",
    historical_score: 45,
    time_pattern_modifier: 1.2,
    weather_modifier: 5,
    traffic_level: "severe",
    waterlogging_flag: false,
    vision_severity: "moderate",
    news_flags: null,
    final_score: 65,
    explanation: "Heavy congestion and moderate road wear.",
    image_url: null,
    image_source: null
  }
];

export const fetchRoute = async (): Promise<RouteSegment[]> => {
  // Simulate network delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockSegments);
    }, 800);
  });
};
