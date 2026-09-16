import { jsPDF } from "jspdf";
import type { RouteRiskResponse, RouteSegment } from "../types/route";

const riskCategory = (score: number) =>
  score >= 75 ? "Severe" : score >= 50 ? "High" : score >= 30 ? "Moderate" : "Low";

const riskColor = (score: number): [number, number, number] =>
  score >= 75 ? [185, 53, 53] : score >= 50 ? [211, 97, 40] : score >= 30 ? [217, 155, 38] : [46, 125, 91];

const CATEGORY_COLORS: Record<string, [number, number, number]> = {
  Low: [46, 125, 91],
  Moderate: [217, 155, 38],
  High: [211, 97, 40],
  Severe: [185, 53, 53],
};

/** Draws a pie chart using triangle-fan approximation (jsPDF has no native arc-fill API). */
function drawPieChart(
  report: jsPDF,
  centerX: number,
  centerY: number,
  radius: number,
  slices: { label: string; value: number; color: [number, number, number] }[]
) {
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  if (total === 0) return;

  let startAngle = -Math.PI / 2; // start at top
  const STEPS_PER_SLICE = 24;

  slices.forEach((slice) => {
    if (slice.value === 0) return;
    const sweep = (slice.value / total) * Math.PI * 2;
    const [r, g, b] = slice.color;
    report.setFillColor(r, g, b);

    for (let i = 0; i < STEPS_PER_SLICE; i++) {
      const a1 = startAngle + (sweep * i) / STEPS_PER_SLICE;
      const a2 = startAngle + (sweep * (i + 1)) / STEPS_PER_SLICE;
      const x1 = centerX + radius * Math.cos(a1);
      const y1 = centerY + radius * Math.sin(a1);
      const x2 = centerX + radius * Math.cos(a2);
      const y2 = centerY + radius * Math.sin(a2);
      report.triangle(centerX, centerY, x1, y1, x2, y2, "F");
    }
    startAngle += sweep;
  });

  // white ring to make it a clean donut + outline
  report.setDrawColor(255, 255, 255);
  report.setLineWidth(0.6);
  report.circle(centerX, centerY, radius, "S");
}

/** Shared client-side report exporter used by live routes and saved-commute snapshots. */
export function downloadSafetyReport(origin: string, destination: string, route: RouteRiskResponse, title = "SafeRoute Telangana — Safety Report") {
  const report = new jsPDF({ orientation: "landscape", unit: "mm", format: "a3" });
  const pageWidth = report.internal.pageSize.getWidth();
  const pageHeight = report.internal.pageSize.getHeight();
  const margin = 12;
  const contentWidth = pageWidth - margin * 2;

  const truncate = (value: string, max: number) => value.length > max ? `${value.slice(0, max - 1)}…` : value;
  const flag = (segment: RouteSegment) => [
    segment.waterlogging_flag ? "Waterlogging" : "",
    segment.news_flags?.length ? "News alert" : "",
  ].filter(Boolean).join(", ") || "None";

  const segments = route.segments;
  const highest = segments.reduce((best, s) => !best || s.final_score > best.final_score ? s : best, segments[0]);
  const hazardSegments = segments.filter(s => s.waterlogging_flag || s.news_flags?.length || s.vision_severity !== "none");
  const waterloggingCount = segments.filter(s => s.waterlogging_flag).length;
  const newsCount = segments.filter(s => s.news_flags?.length).length;
  const surfaceIssueCount = segments.filter(s => s.vision_severity !== "none").length;
  const heavyTrafficCount = segments.filter(s => s.traffic_level === "high" || s.traffic_level === "severe").length;
  const overallCategory = riskCategory(route.route_total_risk);

  // Real data: count segments per risk category
  const categoryCounts: Record<string, number> = { Low: 0, Moderate: 0, High: 0, Severe: 0 };
  segments.forEach(s => { categoryCounts[riskCategory(s.final_score)]++; });

  const footer = () => {
    report.setTextColor(90, 90, 84);
    report.setFontSize(7);
    report.text("Data sources: IIT Delhi Telangana crash dataset, Open-Meteo, TomTom, YOLOv8 road-surface detection, Google News RSS", margin, pageHeight - 6);
    report.text(`Page ${report.getNumberOfPages()}`, pageWidth - margin - 12, pageHeight - 6);
  };

  // ---------- PAGE 1: Header, Executive Summary, Methodology, Charts ----------
  report.setTextColor(26, 26, 24);
  report.setFont("helvetica", "bold");
  report.setFontSize(20);
  report.text(title, margin, 18);

  report.setFont("helvetica", "normal");
  report.setFontSize(9);
  report.text(report.splitTextToSize(`Route: ${origin} \u2192 ${destination}`, contentWidth), margin, 26);
  report.text(`Overall risk score: ${route.route_total_risk}/100 (${overallCategory})     Generated: ${new Date().toLocaleString()}`, margin, 34);

  // Executive summary box
  const summaryTop = 40;
  report.setFillColor(248, 244, 232);
  report.roundedRect(margin, summaryTop, contentWidth, 30, 2, 2, "F");
  report.setFont("helvetica", "bold");
  report.setFontSize(10);
  report.text("Executive Summary", margin + 5, summaryTop + 7);
  report.setFont("helvetica", "normal");
  report.setFontSize(8.5);
  const summaryLines = [
    `This route spans ${segments.length} analyzed road segments, of which ${hazardSegments.length} carry at least one active hazard signal (waterlogging, road-surface damage, or a recent local news report).`,
    `${waterloggingCount} segment(s) show waterlogging risk, ${surfaceIssueCount} show detected road-surface damage, ${heavyTrafficCount} show heavy live traffic, and ${newsCount} are linked to a recent local news report.`,
    `The overall route risk is classified as ${overallCategory.toUpperCase()}, driven primarily by the highest-risk segment identified below.`,
  ];
  report.text(summaryLines, margin + 5, summaryTop + 13, { maxWidth: contentWidth - 10, lineHeightFactor: 1.5 });

  // Highest-risk callout
  const calloutTop = summaryTop + 34;
  const [r, g, b] = riskColor(highest.final_score);
  report.setFillColor(255, 255, 255);
  report.setDrawColor(r, g, b);
  report.roundedRect(margin, calloutTop, contentWidth, 24, 2, 2, "FD");
  report.setFont("helvetica", "bold");
  report.setFontSize(10);
  report.setTextColor(r, g, b);
  report.text(`Highest-risk segment: ${highest.road_name} — ${highest.final_score}/100 (${riskCategory(highest.final_score)})`, margin + 5, calloutTop + 7);
  report.setFont("helvetica", "normal");
  report.setFontSize(8);
  report.setTextColor(26, 26, 24);
  report.text(report.splitTextToSize(highest.explanation, contentWidth - 10), margin + 5, calloutTop + 13);

  // ---------- Visual data section: Pie chart + Bar chart, side by side ----------
  const chartsTop = calloutTop + 32;
  const chartsHeight = 78;
  const halfWidth = contentWidth / 2 - 5;

  // Left: Pie chart — segment count by risk category
  report.setFont("helvetica", "bold");
  report.setFontSize(10);
  report.setTextColor(26, 26, 24);
  report.text("Risk Category Distribution (by segment count)", margin, chartsTop);

  const pieCenterX = margin + halfWidth * 0.32;
  const pieCenterY = chartsTop + chartsHeight / 2 + 4;
  const pieRadius = 26;

  const pieSlices = (["Severe", "High", "Moderate", "Low"] as const).map((cat) => ({
    label: cat,
    value: categoryCounts[cat],
    color: CATEGORY_COLORS[cat],
  }));
  drawPieChart(report, pieCenterX, pieCenterY, pieRadius, pieSlices);

  // Pie legend
  report.setFont("helvetica", "normal");
  report.setFontSize(8);
  let legendY = pieCenterY - 18;
  const legendX = pieCenterX + pieRadius + 14;
  pieSlices.forEach((slice) => {
    const [lr, lg, lb] = slice.color;
    report.setFillColor(lr, lg, lb);
    report.rect(legendX, legendY - 3, 3.5, 3.5, "F");
    report.setTextColor(26, 26, 24);
    const pct = segments.length ? Math.round((slice.value / segments.length) * 100) : 0;
    report.text(`${slice.label}: ${slice.value} segment(s) \u2014 ${pct}%`, legendX + 6, legendY);
    legendY += 8;
  });

  // Right: Horizontal bar chart — hazard signal breakdown (real counts)
  const barLeft = margin + halfWidth + 10;
  report.setFont("helvetica", "bold");
  report.setFontSize(10);
  report.setTextColor(26, 26, 24);
  report.text("Active Hazard Signals (by segment count)", barLeft, chartsTop);

  const barData: { label: string; value: number; color: [number, number, number] }[] = [
    { label: "Road-surface damage", value: surfaceIssueCount, color: [211, 97, 40] },
    { label: "Heavy/severe traffic", value: heavyTrafficCount, color: [217, 155, 38] },
    { label: "Waterlogging risk", value: waterloggingCount, color: [58, 124, 165] },
    { label: "Local news alert", value: newsCount, color: [185, 53, 53] },
  ];
  const maxBarValue = Math.max(...barData.map(d => d.value), 1);
  const barChartWidth = halfWidth - 40;
  const barHeight = 8;
  let barY = chartsTop + 12;

  barData.forEach((d) => {
    report.setFont("helvetica", "normal");
    report.setFontSize(8);
    report.setTextColor(26, 26, 24);
    report.text(d.label, barLeft, barY + barHeight / 2 + 1);

    const labelWidth = 42;
    report.setFillColor(240, 237, 230);
    report.rect(barLeft + labelWidth, barY, barChartWidth, barHeight, "F");

    const [br, bg, bb] = d.color;
    const filledWidth = (d.value / maxBarValue) * barChartWidth;
    if (filledWidth > 0) {
      report.setFillColor(br, bg, bb);
      report.rect(barLeft + labelWidth, barY, filledWidth, barHeight, "F");
    }

    report.setFont("helvetica", "bold");
    report.setTextColor(26, 26, 24);
    report.text(String(d.value), barLeft + labelWidth + barChartWidth + 4, barY + barHeight / 2 + 1);

    barY += barHeight + 6;
  });

  // Methodology
  const methodTop = chartsTop + chartsHeight + 4;
  report.setFont("helvetica", "bold");
  report.setFontSize(10);
  report.setTextColor(26, 26, 24);
  report.text("How this risk score is calculated", margin, methodTop);
  report.setFont("helvetica", "normal");
  report.setFontSize(8);
  const methodText = "Each segment's risk score is built from five real-data signals, added together on a 0\u2013100 scale: (1) historical crash and blackspot density from the IIT Delhi Telangana crash dataset, (2) live traffic congestion from TomTom, (3) road-surface damage detected by a YOLOv8 computer-vision model trained on the RDD2022 India dataset, (4) live weather and waterlogging risk from Open-Meteo, and (5) recent local news or police-dispatch reports from Google News RSS relevant to that road. No single factor alone determines the score \u2014 it reflects the combined, real-time picture across all five sources.";
  report.text(report.splitTextToSize(methodText, contentWidth), margin, methodTop + 6, { lineHeightFactor: 1.5 });

  footer();

  // ---------- PAGE 2+: Segment table with explanations ----------
  report.addPage();
  const tableTop = 20;
  const footerTop = pageHeight - 11;
  const colX = [margin, margin + 90, margin + 112, margin + 150, margin + 190, margin + 220];
  const colTitles = ["Road name", "Risk", "Vision", "Traffic", "Flag", "Key factors"];

  const drawTableHeader = (y: number) => {
    report.setFillColor(212, 162, 52);
    report.rect(margin, y, contentWidth, 7, "F");
    report.setTextColor(26, 26, 24);
    report.setFont("helvetica", "bold");
    report.setFontSize(7.5);
    colTitles.forEach((label, i) => report.text(label, colX[i] + 2, y + 4.6));
  };

  report.setFont("helvetica", "bold");
  report.setFontSize(11);
  report.setTextColor(26, 26, 24);
  report.text("Segment-by-Segment Breakdown", margin, 14);

  let y = tableTop;
  drawTableHeader(y);
  y += 7;

  report.setFont("helvetica", "normal");
  report.setFontSize(6.8);

  segments.forEach((segment, index) => {
    const explanationLines = report.splitTextToSize(segment.explanation, contentWidth - (colX[5] - margin) - 2);
    const rowHeight = Math.max(6, explanationLines.length * 3.2 + 2);

    if (y + rowHeight > footerTop) {
      footer();
      report.addPage();
      y = tableTop;
      drawTableHeader(y);
      y += 7;
    }

    if (index % 2 === 0) {
      report.setFillColor(250, 248, 245);
      report.rect(margin, y, contentWidth, rowHeight, "F");
    }

    const [rr, gg, bb] = riskColor(segment.final_score);
    const baseline = y + 4;
    report.setTextColor(26, 26, 24);
    report.text(truncate(segment.road_name, 42), colX[0] + 2, baseline);
    report.setTextColor(rr, gg, bb);
    report.setFont("helvetica", "bold");
    report.text(`${segment.final_score}/100`, colX[1] + 2, baseline);
    report.setFont("helvetica", "normal");
    report.setTextColor(26, 26, 24);
    report.text(segment.vision_severity, colX[2] + 2, baseline);
    report.text(segment.traffic_level, colX[3] + 2, baseline);
    report.text(flag(segment), colX[4] + 2, baseline);
    report.text(explanationLines, colX[5] + 2, baseline);

    y += rowHeight;
  });

  // ---------- Recommendations ----------
  const recTop = y + 10 > footerTop ? (footer(), report.addPage(), 20) : y + 10;
  report.setFont("helvetica", "bold");
  report.setFontSize(11);
  report.setTextColor(26, 26, 24);
  report.text("Recommendations", margin, recTop);

  const recommendations: string[] = [];
  if (waterloggingCount > 0) recommendations.push(`Avoid this route during or shortly after heavy rainfall \u2014 ${waterloggingCount} segment(s) show active waterlogging risk.`);
  if (surfaceIssueCount > 0) recommendations.push(`Reduce speed near ${surfaceIssueCount} segment(s) with detected road-surface damage, particularly two-wheeler riders.`);
  if (heavyTrafficCount > 0) recommendations.push(`Expect delays at ${heavyTrafficCount} segment(s) with heavy live traffic \u2014 consider off-peak travel where possible.`);
  if (newsCount > 0) recommendations.push(`${newsCount} segment(s) are linked to a recent local news report \u2014 check current local advisories before departure.`);
  if (route.route_total_risk >= 50) recommendations.push("Given the overall risk level, consider checking for a safer alternate route before starting this trip.");
  if (recommendations.length === 0) recommendations.push("No significant hazard signals were detected across this route at the time of analysis. Standard road-safety precautions apply.");

  report.setFont("helvetica", "normal");
  report.setFontSize(8.5);
  let recY = recTop + 7;
  recommendations.forEach((line) => {
    const wrapped = report.splitTextToSize(`\u2022 ${line}`, contentWidth);
    report.text(wrapped, margin, recY, { lineHeightFactor: 1.5 });
    recY += wrapped.length * 4.2 + 2;
  });

  footer();
  report.save("SafeRoute-Telangana-Safety-Report.pdf");
}