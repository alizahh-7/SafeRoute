//frontend/src/services/riskNarrative.ts
//
// SafeRoute Telangana — shared risk narrative layer.
//
// WHY THIS FILE EXISTS
// The backend (backend/src/risk_engine/fusion.py) produces numbers;
// backend/src/risk_engine/explain.py produces a short tag list. Neither one
// explains *why* a number means what it means. This module is the single place
// where SafeRoute turns numbers into human explanation.
//
// Every surface — the PDF safety report, the segment drawer, the diagnostics
// page, the analytics heatmap — imports from here. Write the theory once, it
// appears everywhere, and it can never drift out of sync with the backend.
//
// This file is pure: no JSX, no jsPDF, no side effects.

import type { RouteRiskResponse, RouteSegment } from "../types/route";

/* ------------------------------------------------------------------ *
 * 1. Scoring constants — MIRROR of backend/src/risk_engine/fusion.py  *
 * ------------------------------------------------------------------ */

export const TRAFFIC_POINTS: Record<string, number> = {
  low: 0,
  medium: 5,
  high: 12,
  severe: 20,
  unavailable: 0,
};

export const VISION_POINTS: Record<string, number> = {
  none: 0,
  minor: 5,
  moderate: 12,
  severe: 22,
};

export const WATERLOGGING_POINTS = 15;
export const NEWS_POINTS_MAX = 15;

/* ------------------------------------------------------------------ *
 * 2. Score bands — what a number on the 0–100 scale actually means    *
 * ------------------------------------------------------------------ */

export type Band = "Low" | "Moderate" | "High" | "Severe";

export interface ScoreBand {
  band: Band;
  min: number;
  max: number;
  color: [number, number, number];
  headline: string;
  meaning: string;
  action: string;
}

const LOW_BAND: ScoreBand = {
  band: "Low",
  min: 0,
  max: 29.9,
  color: [46, 125, 91],
  headline: "Normal urban road risk",
  meaning:
    "No single signal is elevated enough to distinguish this stretch from ordinary Hyderabad traffic conditions. It does not mean the road is hazard-free — it means none of SafeRoute's five signals flagged it at the time of analysis.",
  action:
    "Travel as normal. Standard defensive-riding precautions still apply, especially for two-wheelers.",
};

export const SCORE_BANDS: ScoreBand[] = [
  LOW_BAND,
  {
    band: "Moderate",
    min: 30,
    max: 49.9,
    color: [217, 155, 38],
    headline: "One meaningful risk driver present",
    meaning:
      "Typically a stretch with a real crash history, or a combination of live conditions (congestion plus surface damage) that compound each other. The risk is specific and identifiable, not diffuse.",
    action:
      "Reduce speed through this stretch and increase following distance. Read the driver named in the breakdown — the correct precaution differs for a pothole versus a blackspot junction.",
  },
  {
    band: "High",
    min: 50,
    max: 74.9,
    color: [211, 97, 40],
    headline: "Multiple risk drivers stacking",
    meaning:
      "Either a strong historical crash pattern, or several live signals firing at once. In SafeRoute's additive model a score this high cannot come from one mild signal — it requires genuine compounding.",
    action:
      "Consider an alternate route, or delay travel if the drivers are transient (rain, waterlogging, peak congestion). If the driver is historical, the risk will still be there tomorrow.",
  },
  {
    band: "Severe",
    min: 75,
    max: 100,
    color: [185, 53, 53],
    headline: "Avoid if an alternative exists",
    meaning:
      "A known blackspot with fatal crash density nearby, active environmental hazard, and/or heavy congestion simultaneously. This is the combination most strongly associated with fatal two-wheeler and pedestrian outcomes in the Telangana crash record.",
    action:
      "Use the safer alternate route where one is offered. If this stretch is unavoidable, travel it outside peak hours and outside active rainfall.",
  },
];

export function bandFor(score: number): ScoreBand {
  let match: ScoreBand = LOW_BAND;
  for (const band of SCORE_BANDS) {
    if (score >= band.min) match = band;
  }
  return match;
}

export const riskCategory = (score: number): Band => bandFor(score).band;
export const riskColor = (score: number): [number, number, number] =>
  bandFor(score).color;

/* ------------------------------------------------------------------ *
 * 3. Contribution breakdown — reconstructs the additive score          *
 * ------------------------------------------------------------------ */

export interface Contribution {
  signal: string;
  points: number;
  basis: string;
  source: string;
  prose: string;
  available: boolean;
}

const round1 = (n: number) => Math.round(n * 10) / 10;

export function contributionBreakdown(segment: RouteSegment): Contribution[] {
  const historical = round1(segment.historical_score ?? 0);
  const weather = round1(segment.weather_modifier ?? 0);
  const trafficUnavailable = segment.traffic_status === "unavailable";
  const traffic = trafficUnavailable
    ? 0
    : TRAFFIC_POINTS[segment.traffic_level] ?? 0;
  const water = segment.waterlogging_flag ? WATERLOGGING_POINTS : 0;
  const vision = VISION_POINTS[segment.vision_severity] ?? 0;
  const news = round1(NEWS_POINTS_MAX * (segment.news_risk_score ?? 0));

  const rows: Contribution[] = [
    {
      signal: "Historical crash record",
      points: historical,
      basis:
        historical >= 50
          ? "a MoRTH blackspot and dense fatal-crash cluster within 400 m of this segment's midpoint"
          : historical >= 20
          ? "recorded crashes within 300 m of this segment's midpoint"
          : historical > 0
          ? "a small number of recorded crashes in the surrounding area"
          : "no blackspot or recorded crash within the search radius",
      source: "IIT Delhi media-reported crash dataset (2022–23) + MoRTH Black Spot MIS",
      prose:
        "Crash history is the only signal that describes the road itself rather than today's conditions — geometry, junction design, sightlines and speed profile persist long after the weather clears.",
      available: true,
    },
    {
      signal: "Live traffic congestion",
      points: traffic,
      basis: trafficUnavailable
        ? "feed unavailable for this segment"
        : `${segment.traffic_level} congestion` +
          (segment.traffic_flow_ratio != null
            ? ` (flow ratio ${segment.traffic_flow_ratio.toFixed(2)})`
            : ""),
      source: "TomTom live traffic flow",
      prose:
        "Congestion raises risk through speed variance rather than speed alone: stop-start flow multiplies rear-end and lane-change conflicts, and in Indian mixed traffic it pushes two-wheelers into gaps between larger vehicles.",
      available: !trafficUnavailable,
    },
    {
      signal: "Road-surface damage",
      points: vision,
      basis:
        segment.vision_severity === "none"
          ? "no surface defect detected in the inspected frame"
          : `${segment.vision_severity} surface damage detected`,
      source:
        segment.vision_source === "mapillary"
          ? "YOLOv8 on a live Mapillary street-level image of this location"
          : segment.vision_source === "rdd2022_sample"
          ? "YOLOv8 on a representative RDD2022 India image (fallback — not this exact road)"
          : "no street-level image available for this segment",
      prose:
        "Potholes and cracking are disproportionately dangerous for the two-wheeler riders who make up the majority of Telangana's road fatalities, because avoidance is a sudden lateral swerve into adjacent traffic.",
      available: segment.vision_source !== "no_image_available",
    },
    {
      signal: "Weather & waterlogging",
      points: round1(weather + water),
      basis: [
        segment.weather_status === "unavailable"
          ? "weather feed unavailable"
          : segment.weather_precipitation_mm != null
          ? `${segment.weather_precipitation_mm} mm precipitation`
          : "current weather sampled",
        segment.waterlogging_flag
          ? "within range of a known GHMC/HYDRAA waterlogging point, with rain active"
          : "no active waterlogging point nearby",
      ].join("; "),
      source: "Open-Meteo live weather + GHMC/HYDRAA waterlogging-prone points",
      prose:
        "Standing water does two things at once: it lengthens braking distance, and it hides the depth of whatever is underneath it, which is why waterlogging carries a flat 15-point penalty rather than a graded one.",
      available: segment.weather_status !== "unavailable",
    },
    {
      signal: "Recent local news / dispatch",
      points: news,
      basis: segment.news_flags?.length
        ? `${segment.news_flags.length} recent report(s) matched to this road`
        : "no recent report matched to this road",
      source: "Google News RSS, road-name matched and recency-weighted",
      prose:
        "News is SafeRoute's fastest-moving signal — it catches the closures, diversions and fresh incidents that no static dataset and no traffic feed will report for hours.",
      available: true,
    },
  ];

  const summed = round1(rows.reduce((t, r) => t + r.points, 0));
  const residual = round1((segment.final_score ?? 0) - summed);
  if (Math.abs(residual) >= 0.15) {
    rows.push({
      signal: "Scale adjustment",
      points: residual,
      basis:
        residual < 0
          ? "combined signals exceeded the 0–100 scale and were clamped at 100"
          : "rounding reconciliation with the backend fusion output",
      source: "fusion.py",
      prose:
        "SafeRoute caps the fused score at 100, so once several signals are severe the scale saturates and further hazards stop increasing the number.",
      available: true,
    });
  }

  return rows;
}

export function dominantDriver(segment: RouteSegment): Contribution | null {
  const rows = contributionBreakdown(segment).filter(
    (r) => r.points > 0 && r.signal !== "Scale adjustment"
  );
  let best: Contribution | null = null;
  for (const row of rows) {
    if (!best || row.points > best.points) best = row;
  }
  return best;
}

export function scoreArithmetic(segment: RouteSegment): string {
  const parts = contributionBreakdown(segment)
    .filter((r) => r.points !== 0)
    .map((r) => `${r.points} ${r.signal.toLowerCase()}`);
  if (!parts.length) return `0 / 100 — no signal contributed any points.`;
  return `${parts.join("  +  ")}  =  ${segment.final_score} / 100`;
}

/* ------------------------------------------------------------------ *
 * 4. Prose generators                                                 *
 * ------------------------------------------------------------------ */

export function explainSegment(segment: RouteSegment): string {
  const band = bandFor(segment.final_score);
  const driver = dominantDriver(segment);
  const sentences: string[] = [];

  if (!driver) {
    sentences.push(
      `Scored ${segment.final_score}/100 (${band.band}). None of SafeRoute's five signals returned a positive value for this segment: no crash record within the search radius, no surface defect in the inspected frame, no waterlogging point nearby, no congestion penalty and no matching news report.`
    );
    sentences.push(
      "A zero here means nothing was detected, not that the road was inspected and certified safe."
    );
    return sentences.join(" ");
  }

  sentences.push(
    `Scored ${segment.final_score}/100 (${band.band}), driven mainly by ${driver.signal.toLowerCase()} — ${driver.basis}, worth ${driver.points} points of the total.`
  );
  sentences.push(driver.prose);

  const others = contributionBreakdown(segment).filter(
    (r) => r.points > 0 && r.signal !== driver.signal && r.signal !== "Scale adjustment"
  );
  if (others.length) {
    sentences.push(
      `Compounding it: ${others
        .map((r) => `${r.signal.toLowerCase()} (+${r.points})`)
        .join(", ")}.`
    );
  } else if (driver.signal === "Historical crash record") {
    sentences.push(
      "Live conditions are clear today, so what makes this stretch risky is the road itself rather than anything passing — treat the score as a standing property that will still be there tomorrow."
    );
  } else {
    sentences.push(
      "No historical crash cluster was found here, so this is a condition-driven score: it should fall once the live signal clears."
    );
  }

  const blind = contributionBreakdown(segment).filter((r) => !r.available);
  if (blind.length) {
    sentences.push(
      `Note: ${blind
        .map((r) => r.signal.toLowerCase())
        .join(" and ")} could not be read for this segment, so the true score may be higher than shown.`
    );
  }

  sentences.push(band.action);
  return sentences.join(" ");
}

export interface RouteStats {
  segmentCount: number;
  hazardSegments: number;
  waterloggingCount: number;
  newsCount: number;
  surfaceIssueCount: number;
  heavyTrafficCount: number;
  unavailableFeeds: number;
  sampleImageCount: number;
  categoryCounts: Record<Band, number>;
  highest: RouteSegment | null;
  peakScore: number;
  averageScore: number;
}

export function routeStats(route: RouteRiskResponse): RouteStats {
  const segments = route.segments;
  const categoryCounts: Record<Band, number> = {
    Low: 0,
    Moderate: 0,
    High: 0,
    Severe: 0,
  };
  segments.forEach((s) => {
    categoryCounts[riskCategory(s.final_score)]++;
  });

  let highest: RouteSegment | null = null;
  for (const seg of segments) {
    if (!highest || seg.final_score > highest.final_score) highest = seg;
  }

  return {
    segmentCount: segments.length,
    hazardSegments: segments.filter(
      (s) => s.waterlogging_flag || s.news_flags?.length || s.vision_severity !== "none"
    ).length,
    waterloggingCount: segments.filter((s) => s.waterlogging_flag).length,
    newsCount: segments.filter((s) => s.news_flags?.length).length,
    surfaceIssueCount: segments.filter((s) => s.vision_severity !== "none").length,
    heavyTrafficCount: segments.filter(
      (s) => s.traffic_level === "high" || s.traffic_level === "severe"
    ).length,
    unavailableFeeds: segments.filter(
      (s) => s.traffic_status === "unavailable" || s.weather_status === "unavailable"
    ).length,
    sampleImageCount: segments.filter((s) => s.vision_source === "rdd2022_sample").length,
    categoryCounts,
    highest,
    peakScore: highest?.final_score ?? 0,
    averageScore: route.route_total_risk,
  };
}

export function explainRoute(route: RouteRiskResponse): string {
  const s = routeStats(route);
  const peak = s.highest;
  if (!peak) return "No segments were returned for this route, so no risk narrative can be produced.";

  const band = bandFor(s.averageScore);
  const out: string[] = [];

  out.push(
    `The route scores ${s.averageScore}/100 (${band.band}). This figure is the average of all ${s.segmentCount} analyzed segments — it describes how much risk you are exposed to across the whole journey, not the worst moment in it.`
  );

  if (s.peakScore > s.averageScore + 10) {
    const peakBand = bandFor(s.peakScore);
    out.push(
      `Read it alongside the peak: the highest-scoring segment on this route is ${peak.road_name} at ${s.peakScore}/100 (${peakBand.band}). A long route made mostly of quiet stretches will average Low even when it passes through one genuinely dangerous junction, so the average and the peak answer two different questions — "how tiring is this route overall" and "what is the worst thing I will ride through".`
    );
  } else {
    out.push(
      `The peak segment (${peak.road_name}, ${s.peakScore}/100) sits close to the average, so risk is spread fairly evenly along this route rather than concentrated in one junction.`
    );
  }

  const elevated = s.categoryCounts.Moderate + s.categoryCounts.High + s.categoryCounts.Severe;
  out.push(
    elevated === 0
      ? `No segment on this route reached the Moderate band at the time of analysis.`
      : `${elevated} of ${s.segmentCount} segments sit at Moderate or above; the remaining ${s.segmentCount - elevated} are Low. Concentrate attention on the elevated ones rather than on the route-level number.`
  );

  return out.join(" ");
}

/* ------------------------------------------------------------------ *
 * 5. Signal theory — the glossary page                                *
 * ------------------------------------------------------------------ */

export interface SignalTheory {
  id: string;
  title: string;
  source: string;
  weight: string;
  measures: string;
  whyItMatters: string;
  blindSpot: string;
}

export const SIGNAL_THEORY: SignalTheory[] = [
  {
    id: "historical",
    title: "Historical crash record",
    source: "IIT Delhi media-reported crash data (Mendeley) + MoRTH Black Spot MIS",
    weight: "0–100 base score (60% blackspot proximity, 40% crash density)",
    measures:
      "For each segment midpoint, SafeRoute looks for MoRTH-designated blackspots within 400 m and recorded crashes within 300 m. Blackspot contribution is scaled by both distance and the location's yearly accident count; crash contribution is weighted by severity, so a fatal crash counts more than a minor one.",
    whyItMatters:
      "Crash history is a proxy for road design. Junctions with poor sightlines, unsignalled U-turns, missing medians and abrupt speed transitions produce crashes repeatedly, which is why this is the only signal that survives a change in weather, hour or traffic.",
    blindSpot:
      "The dataset is media-reported, so it under-counts non-fatal crashes and over-represents incidents near populated reporting areas. Absence of a record is weak evidence of safety.",
  },
  {
    id: "traffic",
    title: "Live traffic congestion",
    source: "TomTom traffic flow API",
    weight: "low 0 · medium +5 · high +12 · severe +20",
    measures:
      "The ratio of current speed to free-flow speed on the segment, bucketed into four congestion levels sampled at the moment of analysis.",
    whyItMatters:
      "Congestion increases conflict frequency rather than impact energy. Stop-start flow multiplies rear-end and lane-change events, and in Indian mixed traffic it channels two-wheelers into the gaps between heavier vehicles — the exact geometry behind a large share of urban two-wheeler injuries.",
    blindSpot:
      "It is a single instantaneous sample. A report generated at 11 a.m. says nothing about the 6 p.m. condition of the same road.",
  },
  {
    id: "vision",
    title: "Road-surface damage (computer vision)",
    source: "YOLOv8 trained on the RDD2022 India subset; imagery from Mapillary",
    weight: "none 0 · minor +5 · moderate +12 · severe +22",
    measures:
      "A street-level image near the segment midpoint is run through a YOLOv8 detector trained to find potholes, longitudinal and transverse cracking and alligator cracking. Detection count and confidence are collapsed into a four-level severity.",
    whyItMatters:
      "Surface defects are a two-wheeler problem above all. Avoiding a pothole is a sudden lateral movement into adjacent traffic, and hitting one at speed causes loss of control rather than a controlled stop.",
    blindSpot:
      "Mapillary coverage in Hyderabad is patchy. Where no street-level image exists, SafeRoute falls back to a representative RDD2022 image — flagged in this report — which demonstrates the model but does not describe that specific road. Where nothing at all is available, the segment scores zero for surface condition.",
  },
  {
    id: "weather",
    title: "Weather and waterlogging",
    source: "Open-Meteo live weather + GHMC / HYDRAA waterlogging-prone point list",
    weight: "weather modifier (variable) · waterlogging flag +15",
    measures:
      "Current precipitation, wind and visibility at the segment midpoint, combined with proximity to a municipally recorded waterlogging point. The 15-point penalty applies only when both conditions hold: a known flooding location AND active rainfall.",
    whyItMatters:
      "Standing water lengthens braking distance and simultaneously conceals the depth of the defect underneath it. Because the hazard is effectively binary — the road is flooded or it is not — the penalty is flat rather than graded.",
    blindSpot:
      "The waterlogging point list is static and municipal; newly flooding locations are not captured until the list is updated.",
  },
  {
    id: "news",
    title: "Recent local news and dispatch reports",
    source: "Google News RSS, road-name matched and recency-weighted",
    weight: "0 to +15, scaled by a 0–1 relevance/recency score",
    measures:
      "Recent local items are matched against the segment's road name and scored for both topical relevance (crash, closure, protest, roadwork) and recency, producing a 0–1 value that is scaled to a maximum of 15 points.",
    whyItMatters:
      "This is the fastest-moving input in the system. Closures, diversions, flyover repairs and fresh incidents appear in local news hours before any static dataset and often before traffic feeds reflect them.",
    blindSpot:
      "Road-name matching is imprecise: common road names can attract unrelated reports, and a relevant report using a colloquial name will be missed. Treat a news flag as a prompt to check, not as a confirmed hazard.",
  },
];

/* ------------------------------------------------------------------ *
 * 6. Honest limitations, computed from the actual response            *
 * ------------------------------------------------------------------ */

export function dataLimitations(route: RouteRiskResponse): string[] {
  const s = routeStats(route);
  const notes: string[] = [];

  notes.push(
    "This report is a snapshot. Traffic, weather and news signals were sampled once, at the generation time printed on page 1, and are not valid for a different hour of the same day."
  );
  notes.push(
    "A score of zero means no signal was detected, not that the segment was inspected and found safe. SafeRoute renders absence of data and absence of risk identically, which is the most important limitation of the current model."
  );
  notes.push(
    "The crash dataset is media-reported fatal and serious crashes for Telangana (2022–23). Non-fatal crashes are systematically under-represented, so historical scores are conservative on residential and arterial roads with low media coverage."
  );
  notes.push(
    "Signals are added, not statistically weighted. The point values were set from domain reasoning about Indian road conditions, not fitted against crash outcomes, so the score is an explainable risk index rather than a calibrated crash probability."
  );

  if (s.unavailableFeeds > 0) {
    notes.push(
      `${s.unavailableFeeds} segment(s) had at least one live feed unavailable at analysis time and therefore received zero points from it. Their true scores may be higher than reported.`
    );
  }
  if (s.sampleImageCount > 0) {
    notes.push(
      `${s.sampleImageCount} segment(s) had no Mapillary street-level coverage, so the surface-damage assessment used a representative RDD2022 India image. Those vision results demonstrate the model, but do not describe that specific road.`
    );
  }

  return notes;
}

export const SCALE_INTRO =
  "Every segment of this route carries a risk score from 0 to 100. The score is additive: SafeRoute starts from the road's historical crash record and adds points for each live hazard signal present at the moment of analysis. Because the model is additive rather than statistical, every score can be taken apart into the exact signals that produced it — which is what the segment breakdown later in this report does. The score is a comparative risk index, not a probability of a crash occurring.";