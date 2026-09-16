// frontend/src/services/safetyAudit.ts
//
// SafeRoute Telangana — portfolio safety audit PDF.
//
// This is deliberately a different document from safetyReport.ts. A Safety
// Report answers "how risky is this one corridor, right now". A Safety Audit
// answers a different question: "across everything I'm tracking, and every
// check ever recorded for it, where is risk concentrated, and is it getting
// better or worse over time". That's information a single fresh route-risk
// response can't express — it only exists in SavedCommute.snapshots history.
//
// Narrative language still comes from ../services/riskNarrative wherever
// possible, so banding and signal explanations never drift out of sync with
// the single-corridor report.

import { jsPDF } from "jspdf";
import type { RouteSegment, SavedCommute, SafetySnapshot } from "../types/route";
import { bandFor, contributionBreakdown } from "./riskNarrative";

const INK: [number, number, number] = [26, 26, 24];
const MUTED: [number, number, number] = [96, 94, 86];
const CREAM: [number, number, number] = [248, 244, 232];
const RULE: [number, number, number] = [222, 217, 205];
const GOLD: [number, number, number] = [212, 162, 52];

const latest = (c: SavedCommute): SafetySnapshot | null => c.snapshots.at(-1) ?? null;
const first = (c: SavedCommute): SafetySnapshot | null => c.snapshots[0] ?? null;
const previousOf = (c: SavedCommute): SafetySnapshot | null =>
  c.snapshots.length > 1 ? c.snapshots.at(-2)! : null;

const daysSince = (iso: string) =>
  Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);

/** Finds the segment that moved the most between two checks on the same
 *  corridor, and names the single signal most responsible for that move. */
function explainDrift(curr: SafetySnapshot, prev: SafetySnapshot): string {
  const prevById = new Map<string, RouteSegment>(
    prev.route.segments.map((s): [string, RouteSegment] => [s.segment_id, s])
  );
  const prevByRoad = new Map<string, RouteSegment>(
    prev.route.segments.map((s): [string, RouteSegment] => [s.road_name, s])
  );

  let worstSeg: RouteSegment | null = null;
  let worstPrevSeg: RouteSegment | null = null;
  let worstDelta = 0;

  for (const seg of curr.route.segments) {
    const prevSeg = prevById.get(seg.segment_id) ?? prevByRoad.get(seg.road_name);
    if (!prevSeg) continue;
    const delta = seg.final_score - prevSeg.final_score;
    if (worstSeg === null || Math.abs(delta) > Math.abs(worstDelta)) {
      worstSeg = seg;
      worstPrevSeg = prevSeg;
      worstDelta = delta;
    }
  }

  if (!worstSeg || !worstPrevSeg || Math.abs(worstDelta) < 0.5) {
    return "No segment moved meaningfully between these two checks.";
  }

  const currC = contributionBreakdown(worstSeg);
  const prevC = contributionBreakdown(worstPrevSeg);

  let topSignalName = "";
  let topSignalDelta = 0;
  currC.forEach((c, i) => {
    const d = c.points - (prevC[i]?.points ?? 0);
    if (topSignalName === "" || Math.abs(d) > Math.abs(topSignalDelta)) {
      topSignalName = c.signal;
      topSignalDelta = d;
    }
  });

  const dir = worstDelta > 0 ? "rose" : "fell";
  const driver =
    Math.abs(topSignalDelta) >= 1
      ? `, mainly from ${topSignalName.toLowerCase()} (${topSignalDelta > 0 ? "+" : ""}${Math.round(topSignalDelta * 10) / 10} pts)`
      : "";

  return `Biggest mover: ${worstSeg.road_name} ${dir} from ${worstPrevSeg.final_score} to ${worstSeg.final_score}${driver}.`;
}

export function downloadSafetyAudit(
  commutes: SavedCommute[],
  scopeLabel = "All monitored corridors"
) {
  const tracked = commutes.filter((c) => c.snapshots.length > 0);

  const report = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = report.internal.pageSize.getWidth();
  const pageHeight = report.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  const bottomLimit = pageHeight - 18;

  let y = margin;
  const lh = (size: number, factor = 1.4) => size * 0.3528 * factor;
  const newPage = () => {
    report.addPage();
    y = margin;
  };
  const ensure = (needed: number) => {
    if (y + needed > bottomLimit) newPage();
  };
  const setInk = (c: [number, number, number]) => report.setTextColor(c[0], c[1], c[2]);

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

  /* ---------- PAGE 1 — cover + portfolio index ---------- */

  report.setFillColor(INK[0], INK[1], INK[2]);
  report.rect(0, 0, pageWidth, 34, "F");
  report.setFont("helvetica", "bold");
  report.setFontSize(17);
  report.setTextColor(255, 255, 255);
  report.text("SafeRoute Telangana — Corridor Safety Audit", margin, 16);
  report.setFont("helvetica", "normal");
  report.setFontSize(8);
  report.setTextColor(226, 221, 208);
  report.text(
    `Generated ${new Date().toLocaleString()}  ·  AICW Capstone  ·  Scope: ${scopeLabel}`,
    margin,
    24
  );

  y = 42;

  kicker("What this audit is");
  para(
    "A Safety Report looks at one corridor at the moment you asked for it. This audit looks across everything you're tracking, and across every check ever recorded for it, so it can show what a single report can't: which corridors are trending worse, which have gone stale, and where risk is concentrated across your whole commute footprint.",
    9,
    INK,
    5
  );

  if (!tracked.length) {
    para(
      "No tracked corridor has a recorded safety check yet. Run a check from Route Results and save it here, then export this audit again.",
      9.5,
      MUTED
    );
    report.save("SafeRoute-Telangana-Corridor-Audit.pdf");
    return;
  }

  const latestScores = tracked.map((c) => latest(c)!.route.route_total_risk);
  const prevScores = tracked
    .map((c) => previousOf(c)?.route.route_total_risk)
    .filter((v): v is number => v !== undefined);
  const portfolioAvg =
    Math.round((latestScores.reduce((a, b) => a + b, 0) / latestScores.length) * 10) / 10;
  const portfolioPrevAvg = prevScores.length
    ? Math.round((prevScores.reduce((a, b) => a + b, 0) / prevScores.length) * 10) / 10
    : null;
  const portfolioDelta =
    portfolioPrevAvg !== null ? Math.round((portfolioAvg - portfolioPrevAvg) * 10) / 10 : null;
  const band = bandFor(portfolioAvg);
  const totalChecks = tracked.reduce((s, c) => s + c.snapshots.length, 0);
  const worstCorridor = tracked.reduce(
    (w, c) => {
      const s = latest(c)!.route.route_total_risk;
      return !w || s > w.score ? { commute: c, score: s } : w;
    },
    null as { commute: SavedCommute; score: number } | null
  );

  ensure(44);
  const heroTop = y;
  const heroHeight = 38;
  report.setFillColor(CREAM[0], CREAM[1], CREAM[2]);
  report.roundedRect(margin, heroTop, contentWidth, heroHeight, 2, 2, "F");

  report.setFont("helvetica", "bold");
  report.setFontSize(30);
  report.setTextColor(band.color[0], band.color[1], band.color[2]);
  report.text(String(portfolioAvg), margin + 8, heroTop + 20);
  const scoreWidth = report.getTextWidth(String(portfolioAvg));
  report.setFontSize(10);
  report.text("/ 100", margin + 10 + scoreWidth, heroTop + 20);

  report.setFont("helvetica", "bold");
  report.setFontSize(11);
  report.text(`Portfolio safety index — ${band.band.toUpperCase()}`, margin + 8, heroTop + 29);

  if (portfolioDelta !== null) {
    const arrow = portfolioDelta > 0.4 ? "\u2191" : portfolioDelta < -0.4 ? "\u2193" : "\u2192";
    const dCol: [number, number, number] =
      portfolioDelta > 0.4 ? [185, 53, 53] : portfolioDelta < -0.4 ? [46, 125, 91] : MUTED;
    report.setFont("helvetica", "bold");
    report.setFontSize(9);
    setInk(dCol);
    report.text(
      `${arrow} ${portfolioDelta > 0 ? "+" : ""}${portfolioDelta} since previous round of checks`,
      margin + 60,
      heroTop + 11
    );
  }

  report.setFont("helvetica", "normal");
  report.setFontSize(7.5);
  setInk(MUTED);
  report.text(
    `${tracked.length} corridor(s)  ·  ${totalChecks} check(s) recorded  ·  peak ${worstCorridor!.score}/100 (${worstCorridor!.commute.name})`,
    margin + 60,
    heroTop + 19
  );

  y = heroTop + heroHeight + 8;

  /* ---------- Corridor comparison ---------- */

  heading("Corridor comparison", 15, 4);
  para(
    "Sorted worst-first by the most recent check. Trend compares the latest check to the one before it on the same corridor.",
    8.5,
    MUTED,
    4
  );

  const sorted = [...tracked].sort(
    (a, b) => latest(b)!.route.route_total_risk - latest(a)!.route.route_total_risk
  );

  const barLeft = margin + 46;
  const barTrack = contentWidth - 46 - 14;
  const barHeight = 4.5;
  ensure(sorted.length * (barHeight + 4) + 6);
  sorted.forEach((c) => {
    const snap = latest(c)!;
    const b = bandFor(snap.route.route_total_risk);
    report.setFont("helvetica", "normal");
    report.setFontSize(7.5);
    setInk(INK);
    const label = c.name.length > 24 ? c.name.slice(0, 23) + "…" : c.name;
    report.text(label, margin, y + barHeight / 2 + 1);
    report.setFillColor(240, 237, 230);
    report.rect(barLeft, y, barTrack, barHeight, "F");
    const filled = (snap.route.route_total_risk / 100) * barTrack;
    if (filled > 0) {
      report.setFillColor(b.color[0], b.color[1], b.color[2]);
      report.rect(barLeft, y, filled, barHeight, "F");
    }
    report.setFont("helvetica", "bold");
    setInk(INK);
    report.text(String(snap.route.route_total_risk), barLeft + barTrack + 3, y + barHeight / 2 + 1);
    y += barHeight + 4;
  });
  y += 4;
  rule();

  sorted.forEach((c, index) => {
    const snap = latest(c)!;
    const prev = previousOf(c);
    const b = bandFor(snap.route.route_total_risk);
    const delta = prev
      ? Math.round((snap.route.route_total_risk - prev.route.route_total_risk) * 10) / 10
      : null;
    const trendText =
      delta === null
        ? "Baseline only — no previous check yet"
        : `${delta > 0 ? "+" : ""}${delta} vs previous check`;
    const tags = [c.favorite ? "Favourite" : null, c.recurring ? "Recurring" : null]
      .filter(Boolean)
      .join(" · ");

    const bodyText = `${c.origin} → ${c.destination}  ·  ${snap.route.segments.length} segment(s)  ·  ${c.snapshots.length} check(s) recorded  ·  last checked ${new Date(
      snap.checkedAt
    ).toLocaleDateString()} (${daysSince(snap.checkedAt)}d ago)${tags ? `  ·  ${tags}` : ""}`;

    report.setFont("helvetica", "normal");
    report.setFontSize(8);
    const lines = report.splitTextToSize(bodyText, contentWidth - 14) as string[];
    const cardH = 9 + lines.length * lh(8) + lh(8) + 5;
    ensure(cardH + 4);
    const top = y;

    report.setFillColor(
      index % 2 === 0 ? 252 : 255,
      index % 2 === 0 ? 250 : 255,
      index % 2 === 0 ? 246 : 255
    );
    report.setDrawColor(RULE[0], RULE[1], RULE[2]);
    report.setLineWidth(0.3);
    report.roundedRect(margin, top, contentWidth, cardH, 1.5, 1.5, "FD");
    report.setFillColor(b.color[0], b.color[1], b.color[2]);
    report.rect(margin, top, 2.2, cardH, "F");

    report.setFont("helvetica", "bold");
    report.setFontSize(9.5);
    setInk(INK);
    report.text(c.name, margin + 7, top + 7);
    setInk(b.color);
    const scoreLabel = `${snap.route.route_total_risk}/100 · ${b.band}`;
    report.text(scoreLabel, pageWidth - margin - 4 - report.getTextWidth(scoreLabel), top + 7);

    report.setFont("helvetica", "normal");
    report.setFontSize(8);
    setInk(MUTED);
    report.text(lines, margin + 7, top + 12);

    const dCol: [number, number, number] =
      delta === null ? MUTED : delta > 0 ? [185, 53, 53] : delta < 0 ? [46, 125, 91] : MUTED;
    setInk(dCol);
    report.setFont("helvetica", "bold");
    report.text(trendText, margin + 7, top + 12 + lines.length * lh(8) + lh(8) * 0.72);

    y = top + cardH + 4;
  });

  /* ---------- Trend analysis ---------- */

  newPage();
  heading("Trend analysis", 15, 0);
  para(
    "A single check is a snapshot; a saved corridor's real value is the history behind it. This section reads every recorded check for each corridor to show direction of travel, not just current position.",
    9,
    INK,
    6
  );

  const withHistory = sorted.filter((c) => c.snapshots.length >= 2);
  const baselineOnly = sorted.filter((c) => c.snapshots.length < 2);

  withHistory.forEach((c) => {
    const snaps = c.snapshots;
    const scores = snaps.map((s) => s.route.route_total_risk);
    const f = first(c)!;
    const l = latest(c)!;
    const netDelta = Math.round((l.route.route_total_risk - f.route.route_total_risk) * 10) / 10;

    ensure(30);
    report.setFont("helvetica", "bold");
    report.setFontSize(10.5);
    setInk(INK);
    report.text(c.name, margin, y + lh(10.5) * 0.72);
    y += lh(10.5) + 2;

    const sparkLeft = margin;
    const sparkWidth = 60;
    const sparkTop = y;
    const sparkHeight = 14;
    const minS = Math.min(...scores, 0);
    const maxS = Math.max(...scores, 1);
    const range = Math.max(maxS - minS, 1);

    report.setDrawColor(RULE[0], RULE[1], RULE[2]);
    report.setLineWidth(0.2);
    report.rect(sparkLeft, sparkTop, sparkWidth, sparkHeight, "S");

    const lineColor: [number, number, number] =
      netDelta > 0.4 ? [185, 53, 53] : netDelta < -0.4 ? [46, 125, 91] : MUTED;
    report.setDrawColor(lineColor[0], lineColor[1], lineColor[2]);
    report.setLineWidth(0.5);
    scores.forEach((s, i) => {
      if (i === 0) return;
      const x1 = sparkLeft + ((i - 1) / (scores.length - 1)) * sparkWidth;
      const y1 = sparkTop + sparkHeight - ((scores[i - 1] - minS) / range) * sparkHeight;
      const x2 = sparkLeft + (i / (scores.length - 1)) * sparkWidth;
      const y2 = sparkTop + sparkHeight - ((s - minS) / range) * sparkHeight;
      report.line(x1, y1, x2, y2);
    });

    report.setFont("helvetica", "normal");
    report.setFontSize(7.5);
    setInk(MUTED);
    report.text(`${snaps.length} checks`, sparkLeft, sparkTop + sparkHeight + 4);

    const textX = sparkLeft + sparkWidth + 8;
    const textWidth = contentWidth - sparkWidth - 8;

    report.setFont("helvetica", "bold");
    report.setFontSize(8.5);
    setInk(INK);
    report.text(
      `${f.route.route_total_risk} → ${l.route.route_total_risk}  (${netDelta > 0 ? "+" : ""}${netDelta} over ${snaps.length} checks)`,
      textX,
      sparkTop + 4
    );

    report.setFont("helvetica", "normal");
    report.setFontSize(8);
    setInk(MUTED);
    const driftLines = report.splitTextToSize(
      explainDrift(l, snaps[snaps.length - 2]),
      textWidth
    ) as string[];
    report.text(driftLines, textX, sparkTop + 9);

    y = Math.max(sparkTop + sparkHeight + 6, sparkTop + 9 + driftLines.length * lh(8) + 2);
    rule();
  });

  if (baselineOnly.length) {
    heading("Baseline only — no trend yet", 11, 4);
    baselineOnly.forEach((c) =>
      bullet(
        `${c.name}: first check recorded ${new Date(
          first(c)!.checkedAt
        ).toLocaleDateString()}. Trend will appear after the next check.`,
        8.5
      )
    );
  }

  /* ---------- Where risk is concentrated right now ---------- */

  newPage();
  heading("Where risk is concentrated right now", 15, 0);
  para(
    "Counting how many tracked corridors are currently carrying each hazard signal, based on each corridor's most recent check.",
    9,
    INK,
    6
  );

  const flagCounts: Record<string, number> = {
    "Waterlogging active": tracked.filter((c) => latest(c)!.waterloggingActive).length,
    "Surface damage detected": tracked.filter((c) => latest(c)!.visionDetections > 0).length,
    "Heavy/severe traffic": tracked.filter((c) =>
      ["high", "severe", "mixed"].includes(latest(c)!.trafficState)
    ).length,
    "Recent news flags": tracked.filter((c) => latest(c)!.newsCount > 0).length,
    "Weather caution": tracked.filter((c) => latest(c)!.weatherState === "caution").length,
    "A live feed unavailable": tracked.filter((c) => latest(c)!.weatherState === "unavailable")
      .length,
  };

  const flagColors: Record<string, [number, number, number]> = {
    "Waterlogging active": [58, 124, 165],
    "Surface damage detected": [211, 97, 40],
    "Heavy/severe traffic": [217, 155, 38],
    "Recent news flags": [185, 53, 53],
    "Weather caution": [58, 124, 165],
    "A live feed unavailable": MUTED,
  };

  const flagBarLeft = margin + 52;
  const flagBarTrack = contentWidth - 52 - 20;
  const flagBarHeight = 5;
  Object.entries(flagCounts).forEach(([label, count]) => {
    ensure(flagBarHeight + 5);
    report.setFont("helvetica", "normal");
    report.setFontSize(8);
    setInk(INK);
    report.text(label, margin, y + flagBarHeight / 2 + 1);
    report.setFillColor(240, 237, 230);
    report.rect(flagBarLeft, y, flagBarTrack, flagBarHeight, "F");
    const filled = tracked.length ? (count / tracked.length) * flagBarTrack : 0;
    const col = flagColors[label] ?? MUTED;
    if (filled > 0) {
      report.setFillColor(col[0], col[1], col[2]);
      report.rect(flagBarLeft, y, filled, flagBarHeight, "F");
    }
    report.setFont("helvetica", "bold");
    setInk(INK);
    report.text(`${count}/${tracked.length}`, flagBarLeft + flagBarTrack + 3, y + flagBarHeight / 2 + 1);
    y += flagBarHeight + 5;
  });

  /* ---------- Recommendations ---------- */

  heading("Recommendations", 15, 8);
  const recs: string[] = [];

  const stale = tracked.filter((c) => daysSince(latest(c)!.checkedAt) >= 7);
  if (stale.length)
    recs.push(
      `${stale.length} corridor(s) — ${stale.map((c) => c.name).join(", ")} — haven't been rechecked in 7+ days. Live signals (traffic, weather, news) age fast; refresh before relying on their score.`
    );

  const worsening = tracked.filter((c) => {
    const d = previousOf(c);
    return d && latest(c)!.route.route_total_risk - d.route.route_total_risk >= 3;
  });
  if (worsening.length)
    recs.push(
      `${worsening.length} corridor(s) rose 3+ points since their last check: ${worsening
        .map((c) => c.name)
        .join(", ")}. Check the trend section above for what's driving each one before your next trip.`
    );

  const severeNow = tracked.filter((c) => {
    const b = bandFor(latest(c)!.route.route_total_risk).band;
    return b === "High" || b === "Severe";
  });
  if (severeNow.length)
    recs.push(
      `${severeNow.length} corridor(s) are currently High or Severe: ${severeNow
        .map((c) => c.name)
        .join(", ")}. These are the ones worth pulling a full single-corridor Safety Report for before you travel.`
    );

  const recurringAtRisk = tracked.filter((c) => {
    const b = bandFor(latest(c)!.route.route_total_risk).band;
    return c.recurring && (b === "High" || b === "Severe");
  });
  if (recurringAtRisk.length)
    recs.push(
      `${recurringAtRisk.length} of your recurring corridor(s) are elevated right now — these carry the most cumulative exposure since you travel them often.`
    );

  if (!recs.length)
    recs.push(
      "No corridor in this audit is currently elevated, worsening, or stale. Nothing here needs immediate attention."
    );

  recs.forEach((r) => bullet(r, 9));

  /* ---------- How to read this audit ---------- */

  heading("How to read this audit", 15, 8);
  para(
    "This audit compares snapshots recorded at different times, on different days, under different live conditions — unlike a Safety Report, which describes one route at one moment. Keep that in mind before drawing conclusions from the comparisons above.",
    9,
    INK,
    4
  );
  [
    "Every score here comes from the same additive risk engine used across SafeRoute; a Safety Report for any individual corridor explains the full arithmetic behind its number.",
    "Trend lines are built only from checks you (or SafeRoute) actually ran. A corridor checked once a week will look 'stable' between checks purely because nothing was sampled in between, not because conditions were static.",
    "Live-signal flags (traffic, weather, news) reflect each corridor's most recent check only. A corridor flagged clear today may not be clear at the hour you actually travel it.",
    "This audit is a personal, locally stored history, not an official safety certification.",
  ].forEach((n) => bullet(n, 8.5));

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
    report.text(pageLabel, pageWidth - margin - report.getTextWidth(pageLabel), pageHeight - 7.5);
  }

  report.setPage(1);
  report.setFillColor(GOLD[0], GOLD[1], GOLD[2]);
  report.rect(0, 34, pageWidth, 1.2, "F");

  report.save("SafeRoute-Telangana-Corridor-Audit.pdf");
}