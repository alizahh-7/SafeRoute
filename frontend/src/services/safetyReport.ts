//frontend/src/services/safetyReport.ts
//
// SafeRoute Telangana — PDF safety report.
//
// This file is responsible for LAYOUT ONLY. Every explanatory sentence in the
// document comes from ../services/riskNarrative. If you want to change what
// the report *says*, edit riskNarrative.ts, not this file.

import { jsPDF } from "jspdf";
import type { RouteRiskResponse, RouteSegment } from "../types/route";
import {
  SCALE_INTRO,
  SCORE_BANDS,
  SIGNAL_THEORY,
  bandFor,
  contributionBreakdown,
  dataLimitations,
  explainRoute,
  explainSegment,
  riskCategory,
  riskColor,
  routeStats,
  scoreArithmetic,
} from "./riskNarrative";

const INK: [number, number, number] = [26, 26, 24];
const MUTED: [number, number, number] = [96, 94, 86];
const CREAM: [number, number, number] = [248, 244, 232];
const RULE: [number, number, number] = [222, 217, 205];
const GOLD: [number, number, number] = [212, 162, 52];

/** Draws a donut using a triangle fan (jsPDF has no native arc-fill API). */
function drawPieChart(
  report: jsPDF,
  centerX: number,
  centerY: number,
  radius: number,
  slices: { label: string; value: number; color: [number, number, number] }[]
) {
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  if (total === 0) return;

  let startAngle = -Math.PI / 2;
  const STEPS_PER_SLICE = 24;

  slices.forEach((slice) => {
    if (slice.value === 0) return;
    const sweep = (slice.value / total) * Math.PI * 2;
    report.setFillColor(slice.color[0], slice.color[1], slice.color[2]);
    for (let i = 0; i < STEPS_PER_SLICE; i++) {
      const a1 = startAngle + (sweep * i) / STEPS_PER_SLICE;
      const a2 = startAngle + (sweep * (i + 1)) / STEPS_PER_SLICE;
      report.triangle(
        centerX,
        centerY,
        centerX + radius * Math.cos(a1),
        centerY + radius * Math.sin(a1),
        centerX + radius * Math.cos(a2),
        centerY + radius * Math.sin(a2),
        "F"
      );
    }
    startAngle += sweep;
  });

  report.setDrawColor(255, 255, 255);
  report.setLineWidth(0.6);
  report.circle(centerX, centerY, radius, "S");
}

export function downloadSafetyReport(
  origin: string,
  destination: string,
  route: RouteRiskResponse,
  title = "SafeRoute Telangana — Safety Report"
) {
  const report = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = report.internal.pageSize.getWidth();
  const pageHeight = report.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  const bottomLimit = pageHeight - 18;

  const stats = routeStats(route);
  const segments = route.segments;
  const overallBand = bandFor(route.route_total_risk);

  let y = margin;

  const lh = (size: number, factor = 1.4) => size * 0.3528 * factor;

  const newPage = () => {
    report.addPage();
    y = margin;
  };

  const ensure = (needed: number) => {
    if (y + needed > bottomLimit) newPage();
  };

  const setInk = (c: [number, number, number]) =>
    report.setTextColor(c[0], c[1], c[2]);

  const kicker = (text: string) => {
    ensure(8);
    report.setFont("helvetica", "bold");
    report.setFontSize(7);
    setInk(MUTED);
    report.text(text.toUpperCase(), margin, y + 3);
    y += 6;
  };

  const heading = (text: string, size = 13, gapBefore = 5) => {
    y += gapBefore;
    ensure(lh(size) + 4);
    report.setFont("helvetica", "bold");
    report.setFontSize(size);
    setInk(INK);
    report.text(text, margin, y + lh(size) * 0.75);
    y += lh(size) + 3;
  };

  const para = (
    text: string,
    size = 9,
    color: [number, number, number] = INK,
    gapAfter = 3.5,
    width = contentWidth,
    x = margin
  ) => {
    report.setFont("helvetica", "normal");
    report.setFontSize(size);
    setInk(color);
    const lines = report.splitTextToSize(text, width) as string[];
    lines.forEach((line) => {
      ensure(lh(size));
      report.setFont("helvetica", "normal");
      report.setFontSize(size);
      setInk(color);
      report.text(line, x, y + lh(size) * 0.72);
      y += lh(size);
    });
    y += gapAfter;
  };

  const bullet = (text: string, size = 9) => {
    const indent = 4.5;
    report.setFont("helvetica", "normal");
    report.setFontSize(size);
    const lines = report.splitTextToSize(text, contentWidth - indent) as string[];
    lines.forEach((line, i) => {
      ensure(lh(size));
      report.setFont("helvetica", "normal");
      report.setFontSize(size);
      setInk(INK);
      if (i === 0) report.text("\u2022", margin, y + lh(size) * 0.72);
      report.text(line, margin + indent, y + lh(size) * 0.72);
      y += lh(size);
    });
    y += 2.5;
  };

  const rule = () => {
    ensure(4);
    report.setDrawColor(RULE[0], RULE[1], RULE[2]);
    report.setLineWidth(0.3);
    report.line(margin, y, pageWidth - margin, y);
    y += 4;
  };

  /* ---------- PAGE 1 ---------- */

  report.setFillColor(INK[0], INK[1], INK[2]);
  report.rect(0, 0, pageWidth, 34, "F");
  report.setFont("helvetica", "bold");
  report.setFontSize(17);
  report.setTextColor(255, 255, 255);
  report.text(title, margin, 16);
  report.setFont("helvetica", "normal");
  report.setFontSize(8);
  report.setTextColor(226, 221, 208);
  report.text(
    `Generated ${new Date().toLocaleString()}  ·  AICW Capstone  ·  Hyderabad, Telangana`,
    margin,
    24
  );

  y = 42;

  kicker("Corridor analyzed");
  para(`${origin}  \u2192  ${destination}`, 9.5, INK, 5);

  ensure(40);
  const heroTop = y;
  const heroHeight = 34;
  report.setFillColor(CREAM[0], CREAM[1], CREAM[2]);
  report.roundedRect(margin, heroTop, contentWidth, heroHeight, 2, 2, "F");

  const bc = overallBand.color;
  report.setFont("helvetica", "bold");
  report.setFontSize(30);
  report.setTextColor(bc[0], bc[1], bc[2]);
  report.text(String(route.route_total_risk), margin + 8, heroTop + 20);

  const scoreWidth = report.getTextWidth(String(route.route_total_risk));
  report.setFontSize(10);
  report.text("/ 100", margin + 10 + scoreWidth, heroTop + 20);

  report.setFont("helvetica", "bold");
  report.setFontSize(11);
  report.text(
    `${overallBand.band.toUpperCase()} — ${overallBand.headline}`,
    margin + 8,
    heroTop + 28
  );

  report.setFont("helvetica", "normal");
  report.setFontSize(7.5);
  setInk(MUTED);
  report.text(
    `Average of ${stats.segmentCount} segments  ·  Peak segment ${stats.peakScore}/100`,
    margin + 60,
    heroTop + 11
  );

  y = heroTop + heroHeight + 6;

  heading("How to read this report", 13, 2);
  para(SCALE_INTRO, 9, INK, 5);

  SCORE_BANDS.slice()
    .reverse()
    .forEach((band) => {
      report.setFont("helvetica", "bold");
      report.setFontSize(9);
      const labelLine = `${band.band}  (${band.min}\u2013${band.max})  —  ${band.headline}`;
      ensure(lh(9) + 2);
      report.setFillColor(band.color[0], band.color[1], band.color[2]);
      report.rect(margin, y + 1, 2.2, lh(9) * 0.9, "F");
      setInk(INK);
      report.text(labelLine, margin + 5.5, y + lh(9) * 0.72);
      y += lh(9) + 0.5;
      para(band.meaning, 8, MUTED, 1.5, contentWidth - 5.5, margin + 5.5);
      para(`What to do: ${band.action}`, 8, INK, 4, contentWidth - 5.5, margin + 5.5);
    });

    /* ---------- PAGE 1.5 — Quick-reference table ---------- */

  newPage();

  heading("Quick-reference table", 15, 0);
  para(
    "A one-glance version of this report — every segment, its score and its live conditions, for a fast check before you leave. The pages that follow explain the reasoning behind each number.",
    9,
    MUTED,
    5
  );

  if (stats.highest) {
    report.setFont("helvetica", "bold");
    report.setFontSize(9.5);
    setInk(riskColor(stats.highest.final_score));
    report.text(
      `Highest-risk segment: ${stats.highest.road_name} (${stats.highest.final_score}/100)`,
      margin,
      y + lh(9.5) * 0.72
    );
    y += lh(9.5) + 4;
  }

  const qCols = [
    { title: "Road name", x: margin, width: contentWidth * 0.4 },
    { title: "Risk", x: margin + contentWidth * 0.4, width: contentWidth * 0.12 },
    { title: "Vision severity", x: margin + contentWidth * 0.52, width: contentWidth * 0.18 },
    { title: "Traffic level", x: margin + contentWidth * 0.7, width: contentWidth * 0.15 },
    { title: "Active flag", x: margin + contentWidth * 0.85, width: contentWidth * 0.15 },
  ];
  const qRowHeight = 6;

  const drawQuickHeader = () => {
    ensure(qRowHeight + 2);
    report.setFillColor(GOLD[0], GOLD[1], GOLD[2]);
    report.rect(margin, y, contentWidth, qRowHeight, "F");
    report.setFont("helvetica", "bold");
    report.setFontSize(7.5);
    setInk(INK);
    qCols.forEach((c) => report.text(c.title, c.x + 2, y + qRowHeight * 0.68));
    y += qRowHeight;
  };

  drawQuickHeader();

  segments.forEach((segment, index) => {
    if (y + qRowHeight > bottomLimit) {
      newPage();
      drawQuickHeader();
    }
    if (index % 2 === 0) {
      report.setFillColor(250, 248, 245);
      report.rect(margin, y, contentWidth, qRowHeight, "F");
    }
    const baseline = y + qRowHeight * 0.68;
    const flags =
      [
        segment.waterlogging_flag ? "Waterlogging" : null,
        (segment.news_flags?.length ?? 0) > 0 ? "News" : null,
      ]
        .filter(Boolean)
        .join(", ") || "None";
    const roadName =
      segment.road_name.length > 46 ? segment.road_name.slice(0, 45) + "…" : segment.road_name;

    report.setFont("helvetica", "normal");
    report.setFontSize(7.5);
    setInk(INK);
    report.text(roadName, qCols[0].x + 2, baseline);

    report.setFont("helvetica", "bold");
    setInk(riskColor(segment.final_score));
    report.text(`${segment.final_score}/100`, qCols[1].x + 2, baseline);

    report.setFont("helvetica", "normal");
    setInk(INK);
    report.text(segment.vision_severity, qCols[2].x + 2, baseline);
    report.text(
      segment.traffic_status === "unavailable" ? "n/a" : segment.traffic_level,
      qCols[3].x + 2,
      baseline
    );
    report.text(flags, qCols[4].x + 2, baseline);

    y += qRowHeight;
  });

  y += 4;
  rule();

  /* ---------- PAGE 2 ---------- */

  newPage();

  heading("Executive summary", 15, 0);
  para(explainRoute(route), 9.5, INK, 5);

  para(
    `Across the corridor, ${stats.hazardSegments} of ${stats.segmentCount} segments carry at least one active hazard signal. ` +
      `${stats.waterloggingCount} show waterlogging risk, ${stats.surfaceIssueCount} show detected road-surface damage, ` +
      `${stats.heavyTrafficCount} show heavy or severe live traffic, and ${stats.newsCount} are linked to a recent local news report.`,
    9,
    INK,
    5
  );

  const hi = stats.highest;

  if (hi) {
    const hiColor = riskColor(hi.final_score);
    report.setFont("helvetica", "normal");
    report.setFontSize(8.5);
    const hiLines = report.splitTextToSize(
      explainSegment(hi),
      contentWidth - 12
    ) as string[];
    const calloutHeight = 14 + hiLines.length * lh(8.5) + 6;
    ensure(calloutHeight + 4);

    const calloutTop = y;
    report.setFillColor(255, 255, 255);
    report.setDrawColor(hiColor[0], hiColor[1], hiColor[2]);
    report.setLineWidth(0.5);
    report.roundedRect(margin, calloutTop, contentWidth, calloutHeight, 2, 2, "FD");
    report.setFillColor(hiColor[0], hiColor[1], hiColor[2]);
    report.rect(margin, calloutTop, 2.5, calloutHeight, "F");

    report.setFont("helvetica", "bold");
    report.setFontSize(10);
    report.setTextColor(hiColor[0], hiColor[1], hiColor[2]);
    report.text(
      `Highest-risk segment: ${hi.road_name} — ${hi.final_score}/100 (${riskCategory(
        hi.final_score
      )})`,
      margin + 7,
      calloutTop + 8
    );
    report.setFont("helvetica", "normal");
    report.setFontSize(8.5);
    setInk(INK);
    report.text(hiLines, margin + 7, calloutTop + 14);
    y = calloutTop + calloutHeight + 8;
  }

  heading("Where the risk sits", 13, 2);

  const halfWidth = contentWidth / 2 - 4;
  const chartsTop = y;

  report.setFont("helvetica", "bold");
  report.setFontSize(9);
  setInk(INK);
  report.text("Risk category distribution", margin, chartsTop + 3);

  const pieRadius = 19;
  const pieCenterX = margin + pieRadius + 2;
  const pieCenterY = chartsTop + 12 + pieRadius;

  const pieSlices = SCORE_BANDS.slice()
    .reverse()
    .map((b) => ({
      label: b.band,
      value: stats.categoryCounts[b.band],
      color: b.color,
    }));
  drawPieChart(report, pieCenterX, pieCenterY, pieRadius, pieSlices);

  let legendY = pieCenterY - 13;
  const legendX = pieCenterX + pieRadius + 5;
  report.setFont("helvetica", "normal");
  report.setFontSize(7.5);
  pieSlices.forEach((slice) => {
    report.setFillColor(slice.color[0], slice.color[1], slice.color[2]);
    report.rect(legendX, legendY - 2.4, 2.8, 2.8, "F");
    setInk(INK);
    const pct = stats.segmentCount
      ? Math.round((slice.value / stats.segmentCount) * 100)
      : 0;
    report.text(`${slice.label}: ${slice.value} (${pct}%)`, legendX + 4.5, legendY);
    legendY += 6.5;
  });

  const barLeft = margin + halfWidth + 8;
  report.setFont("helvetica", "bold");
  report.setFontSize(9);
  setInk(INK);
  report.text("Active hazard signals", barLeft, chartsTop + 3);

  const barData: { label: string; value: number; color: [number, number, number] }[] = [
    { label: "Surface damage", value: stats.surfaceIssueCount, color: [211, 97, 40] },
    { label: "Heavy traffic", value: stats.heavyTrafficCount, color: [217, 155, 38] },
    { label: "Waterlogging", value: stats.waterloggingCount, color: [58, 124, 165] },
    { label: "News alert", value: stats.newsCount, color: [185, 53, 53] },
  ];
  const maxBarValue = Math.max(...barData.map((d) => d.value), 1);
  const labelWidth = 26;
  const barTrack = halfWidth - labelWidth - 10;
  const barHeight = 6;
  let barY = chartsTop + 10;

  barData.forEach((d) => {
    report.setFont("helvetica", "normal");
    report.setFontSize(7.5);
    setInk(INK);
    report.text(d.label, barLeft, barY + barHeight / 2 + 1);
    report.setFillColor(240, 237, 230);
    report.rect(barLeft + labelWidth, barY, barTrack, barHeight, "F");
    const filled = (d.value / maxBarValue) * barTrack;
    if (filled > 0) {
      report.setFillColor(d.color[0], d.color[1], d.color[2]);
      report.rect(barLeft + labelWidth, barY, filled, barHeight, "F");
    }
    report.setFont("helvetica", "bold");
    setInk(INK);
    report.text(String(d.value), barLeft + labelWidth + barTrack + 3, barY + barHeight / 2 + 1);
    barY += barHeight + 5;
  });

  y = Math.max(pieCenterY + pieRadius, barY) + 6;

  para(
    stats.categoryCounts.High + stats.categoryCounts.Severe > 0
      ? "The distribution matters more than the average. Segments in the High and Severe bands are where a change of route or a change of departure time actually buys you something; the Low-band segments are already as good as this corridor gets."
      : "The distribution is weighted toward the Low band, which means this corridor has no single dominant danger point. Read the hazard-signal counts on the right as a list of things to expect along the way rather than as reasons to avoid the route.",
    8.5,
    MUTED,
    4
  );

  /* ---------- PAGE 3 — theory ---------- */

  newPage();

  heading("The five signals behind every score", 15, 0);
  para(
    "SafeRoute does not use one model. It fuses five independent evidence streams, each measuring something different about a road, and adds their contributions on a common 0\u2013100 scale. Below is what each one measures, why it predicts crash risk, and — equally important — what it cannot see.",
    9,
    INK,
    5
  );

  SIGNAL_THEORY.forEach((sig) => {
    ensure(28);
    report.setFont("helvetica", "bold");
    report.setFontSize(10.5);
    setInk(INK);
    report.text(sig.title, margin, y + lh(10.5) * 0.72);
    y += lh(10.5) + 1;

    report.setFont("helvetica", "italic");
    report.setFontSize(7.5);
    setInk(MUTED);
    const metaLines = report.splitTextToSize(
      `${sig.source}  ·  Contribution: ${sig.weight}`,
      contentWidth
    ) as string[];
    metaLines.forEach((line) => {
      ensure(lh(7.5));
      report.setFont("helvetica", "italic");
      report.setFontSize(7.5);
      setInk(MUTED);
      report.text(line, margin, y + lh(7.5) * 0.72);
      y += lh(7.5);
    });
    y += 2;

    para(`What it measures. ${sig.measures}`, 8.5, INK, 2);
    para(`Why it predicts risk. ${sig.whyItMatters}`, 8.5, INK, 2);
    para(`Blind spot. ${sig.blindSpot}`, 8.5, MUTED, 5);
    rule();
  });

  /* ---------- PAGE 4+ — segments ---------- */

  newPage();

  heading("Segment-by-segment breakdown", 15, 0);
  para(
    "Each card below shows how that segment's score was assembled. The arithmetic line is the literal sum computed by the risk engine — every point in the total is traceable to a named signal, with nothing hidden in a weighting matrix.",
    9,
    INK,
    6
  );

  const drawSegmentCard = (segment: RouteSegment, index: number) => {
    const band = bandFor(segment.final_score);
    const arithmetic = scoreArithmetic(segment);
    const narrative = explainSegment(segment);
    const contributions = contributionBreakdown(segment).filter((c) => c.points !== 0);

    report.setFont("helvetica", "normal");
    report.setFontSize(7.5);
    const arithLines = report.splitTextToSize(arithmetic, contentWidth - 14) as string[];
    report.setFontSize(8.5);
    const narrLines = report.splitTextToSize(narrative, contentWidth - 14) as string[];
    report.setFontSize(7.5);
    const metaText =
      contributions.length > 0
        ? contributions.map((c) => `${c.signal}: +${c.points}`).join("   ·   ")
        : "No signal returned a positive contribution for this segment.";
    const metaLines = report.splitTextToSize(metaText, contentWidth - 14) as string[];

    const cardHeight =
      9 +
      arithLines.length * lh(7.5) +
      2 +
      narrLines.length * lh(8.5) +
      2 +
      metaLines.length * lh(7.5) +
      7;

    ensure(cardHeight + 4);
    const top = y;

    report.setFillColor(index % 2 === 0 ? 252 : 255, index % 2 === 0 ? 250 : 255, index % 2 === 0 ? 246 : 255);
    report.setDrawColor(RULE[0], RULE[1], RULE[2]);
    report.setLineWidth(0.3);
    report.roundedRect(margin, top, contentWidth, cardHeight, 1.5, 1.5, "FD");
    report.setFillColor(band.color[0], band.color[1], band.color[2]);
    report.rect(margin, top, 2.2, cardHeight, "F");

    report.setFont("helvetica", "bold");
    report.setFontSize(9.5);
    setInk(INK);
    report.text(
      `${String(index + 1).padStart(2, "0")}.  ${segment.road_name}`,
      margin + 7,
      top + 7
    );
    report.setTextColor(band.color[0], band.color[1], band.color[2]);
    const scoreLabel = `${segment.final_score}/100 · ${band.band}`;
    report.text(
      scoreLabel,
      pageWidth - margin - 4 - report.getTextWidth(scoreLabel),
      top + 7
    );

    let cy = top + 11;

    report.setFont("helvetica", "normal");
    report.setFontSize(7.5);
    setInk(MUTED);
    report.text(arithLines, margin + 7, cy + lh(7.5) * 0.72);
    cy += arithLines.length * lh(7.5) + 2;

    report.setFontSize(8.5);
    setInk(INK);
    report.text(narrLines, margin + 7, cy + lh(8.5) * 0.72);
    cy += narrLines.length * lh(8.5) + 2;

    report.setFontSize(7.5);
    setInk(MUTED);
    report.text(metaLines, margin + 7, cy + lh(7.5) * 0.72);

    y = top + cardHeight + 4;
  };

  segments.forEach(drawSegmentCard);

  /* ---------- Recommendations ---------- */

  heading("Recommendations", 15, 8);

  const recommendations: string[] = [];
  if (stats.waterloggingCount > 0)
    recommendations.push(
      `Avoid this corridor during or shortly after heavy rainfall — ${stats.waterloggingCount} segment(s) sit near recorded waterlogging points with rain currently active. Standing water conceals the depth of whatever is beneath it.`
    );
  if (stats.surfaceIssueCount > 0)
    recommendations.push(
      `Reduce speed across ${stats.surfaceIssueCount} segment(s) with detected surface damage, particularly on two wheels — the danger is the swerve, not the pothole.`
    );
  if (stats.heavyTrafficCount > 0)
    recommendations.push(
      `Expect stop-start conditions on ${stats.heavyTrafficCount} segment(s). Where the schedule allows, shifting departure outside the peak window removes this contribution from the score entirely.`
    );
  if (stats.newsCount > 0)
    recommendations.push(
      `${stats.newsCount} segment(s) matched a recent local news report. Treat this as a prompt to check current advisories before departure rather than as a confirmed closure.`
    );
  if (stats.categoryCounts.High + stats.categoryCounts.Severe > 0)
    recommendations.push(
      `${stats.categoryCounts.High + stats.categoryCounts.Severe} segment(s) reached the High or Severe band. Check SafeRoute's alternate-route suggestion before starting this trip — a few extra minutes usually buys the larger reduction here.`
    );
  if (stats.highest && stats.peakScore >= 30)
    recommendations.push(
      `The single most useful precaution on this route is at ${stats.highest.road_name}. Plan to be alert and unhurried through that stretch specifically.`
    );
  if (!recommendations.length)
    recommendations.push(
      "No significant hazard signals were detected across this corridor at the time of analysis. Standard defensive-riding precautions apply — and note the limitations below before treating this as an all-clear."
    );

  recommendations.forEach((r) => bullet(r, 9));

  /* ---------- Data provenance & limitations ---------- */

  heading("Data provenance and limitations", 15, 8);
  para(
    "SafeRoute is an explainable risk index built for a capstone project, not a certified safety instrument. The following constraints are inherent to the current model and should be read before acting on any score in this report.",
    9,
    INK,
    4
  );
  dataLimitations(route).forEach((note) => bullet(note, 8.5));

  /* ---------- Footers ---------- */

  const totalPages = report.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    report.setPage(p);
    report.setDrawColor(RULE[0], RULE[1], RULE[2]);
    report.setLineWidth(0.3);
    report.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
    report.setFont("helvetica", "normal");
    report.setFontSize(6.5);
    report.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
    report.text(
      "Sources: IIT Delhi Telangana crash dataset · MoRTH Black Spot MIS · Open-Meteo · TomTom · YOLOv8 / RDD2022 · Google News RSS",
      margin,
      pageHeight - 7.5
    );
    const pageLabel = `Page ${p} of ${totalPages}`;
    report.text(
      pageLabel,
      pageWidth - margin - report.getTextWidth(pageLabel),
      pageHeight - 7.5
    );
  }

  report.setPage(1);
  report.setFillColor(GOLD[0], GOLD[1], GOLD[2]);
  report.rect(0, 34, pageWidth, 1.2, "F");

  report.save("SafeRoute-Telangana-Safety-Report.pdf");
}

