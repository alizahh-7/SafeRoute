import { jsPDF } from "jspdf";
import type { RouteRiskResponse, RouteSegment } from "../types/route";

/** Shared client-side report exporter used by live routes and saved-commute snapshots. */
export function downloadSafetyReport(origin: string, destination: string, route: RouteRiskResponse, title = "SafeRoute Telangana — Safety Report") {
  const report = new jsPDF({ orientation: "landscape", unit: "mm", format: "a3" });
  const pageWidth = report.internal.pageSize.getWidth(); const pageHeight = report.internal.pageSize.getHeight(); const margin = 12;
  const truncate = (value: string, max: number) => value.length > max ? `${value.slice(0, max - 1)}…` : value;
  const highest = route.segments.reduce((best, segment) => !best || segment.final_score > best.final_score ? segment : best, route.segments[0]);
  const flag = (segment: RouteSegment) => [segment.waterlogging_flag ? "Waterlogging" : "", segment.news_flags?.length ? "News" : ""].filter(Boolean).join(", ") || "None";
  report.setTextColor(26, 26, 24); report.setFont("helvetica", "bold"); report.setFontSize(20); report.text(title, margin, 18);
  report.setFont("helvetica", "normal"); report.setFontSize(9); report.text(`Route: ${origin} → ${destination}`, margin, 26); report.text(`Overall risk: ${route.route_total_risk}/100     Generated: ${new Date().toLocaleString()}`, margin, 32);
  report.setFillColor(248, 244, 232); report.roundedRect(margin, 38, pageWidth - margin * 2, 22, 2, 2, "F"); report.setFont("helvetica", "bold"); report.text(`Highest-risk segment: ${highest.road_name} (${highest.final_score}/100)`, margin + 5, 45); report.setFont("helvetica", "normal"); report.setFontSize(7.5); report.text(report.splitTextToSize(highest.explanation, pageWidth - margin * 2 - 10).slice(0, 2), margin + 5, 51);
  const tableTop = 68; const footerTop = pageHeight - 11; const rowHeight = Math.max(3.2, Math.min(6, (footerTop - tableTop - 8) / Math.max(route.segments.length, 1))); const x = [margin, margin + 124, margin + 150, margin + 198, margin + 240];
  report.setFillColor(212, 162, 52); report.rect(margin, tableTop, pageWidth - margin * 2, 7, "F"); report.setFont("helvetica", "bold"); report.setFontSize(7.5); ["Road name", "Risk", "Vision severity", "Traffic level", "Active flag"].forEach((label, index) => report.text(label, x[index] + 2, tableTop + 4.6));
  report.setFont("helvetica", "normal"); report.setFontSize(Math.max(5.5, Math.min(7.5, rowHeight + 1.2)));
  route.segments.forEach((segment, index) => { const y = tableTop + 7 + rowHeight * index; if (index % 2 === 0) { report.setFillColor(250, 248, 245); report.rect(margin, y, pageWidth - margin * 2, rowHeight, "F"); } const base = y + rowHeight * .68; [truncate(segment.road_name, 58), `${segment.final_score}/100`, segment.vision_severity, segment.traffic_level, truncate(flag(segment), 42)].forEach((value, itemIndex) => report.text(value, x[itemIndex] + 2, base)); });
  report.setTextColor(90, 90, 84); report.setFontSize(7); report.text("Data sources: IIT Delhi Telangana crash dataset, Open-Meteo, TomTom, YOLOv8 road-surface detection, Google News RSS", margin, pageHeight - 6); report.save("SafeRoute-Telangana-Safety-Report.pdf");
}
