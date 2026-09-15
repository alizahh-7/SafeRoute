import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Bookmark,
  CarFront,
  Check,
  Download,
  Droplets,
  History,
  MapPinned,
  Newspaper,
  Pencil,
  RefreshCw,
  Route,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { motion } from "framer-motion";
import { useRouteContext } from "../context/RouteContext";
import { downloadSafetyReport } from "../services/safetyReport";
import type {
  RouteSegment,
  SavedCommute,
  SafetySnapshot,
  VisionSeverity,
} from "../types/route";

/* ---------------------------------------------------------- */
/* Palette — cream / gold "corridor guardian" theme            */
/* ---------------------------------------------------------- */

const P = {
  bg: "#FAF6EC",
  surface: "#FFFFFF",
  surfaceAlt: "#F4EEDF",
  surfaceLow: "#F0E9D8",
  ink: "#181510",
  inkSoft: "#8A8171",
  inkFaint: "#B4AB98",
  line: "#E7DFCC",
  accent: "#D9A441",
  accentDeep: "#B9822B",
  green: "#2E7D5B",
  yellow: "#D99B26",
  orange: "#D36128",
  red: "#B93535",
};

const shell =
  "w-full max-w-[1500px] mx-auto px-layout-margin-mobile md:px-layout-margin-tablet lg:px-layout-margin-desktop";

/* ---------------------------------------------------------- */
/* Pure helpers — unchanged logic                              */
/* ---------------------------------------------------------- */

const riskTone = (score: number) =>
  score >= 75
    ? P.red
    : score >= 50
      ? P.orange
      : score >= 30
        ? P.yellow
        : P.green;

const riskName = (score: number) =>
  score >= 75
    ? "Severe"
    : score >= 50
      ? "High"
      : score >= 30
        ? "Moderate"
        : "Low";

const age = (time: string) => {
  const minutes = Math.max(
    0,
    Math.floor((Date.now() - new Date(time).getTime()) / 60000),
  );
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)} hr ago`;
  return `${Math.floor(minutes / 1440)} days ago`;
};

const shortDateTime = (time: string) =>
  new Date(time).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });

function latest(commute: SavedCommute): SafetySnapshot | null {
  return commute.snapshots.at(-1) ?? null;
}

function previousOf(commute: SavedCommute): SafetySnapshot | null {
  return commute.snapshots.length > 1 ? commute.snapshots.at(-2)! : null;
}

const TRAFFIC_RANK: Record<string, number> = {
  low: 0,
  medium: 1,
  high: 2,
  severe: 3,
};

const VISION_RANK: Record<VisionSeverity, number> = {
  none: 0,
  minor: 1,
  moderate: 2,
  severe: 3,
};

function explainDelta(curr: RouteSegment, prev: RouteSegment): string {
  const reasons: { label: string; weight: number }[] = [];

  if (
    curr.traffic_level !== prev.traffic_level &&
    curr.traffic_level in TRAFFIC_RANK &&
    prev.traffic_level in TRAFFIC_RANK
  ) {
    reasons.push({
      label: `Traffic ${prev.traffic_level} → ${curr.traffic_level}`,
      weight:
        Math.abs(
          TRAFFIC_RANK[curr.traffic_level] - TRAFFIC_RANK[prev.traffic_level],
        ) * 6,
    });
  }

  if (curr.vision_severity !== prev.vision_severity) {
    reasons.push({
      label: `Road surface ${prev.vision_severity} → ${curr.vision_severity}`,
      weight:
        Math.abs(
          VISION_RANK[curr.vision_severity] - VISION_RANK[prev.vision_severity],
        ) *
          6 +
        2,
    });
  }

  if (curr.weather_modifier !== prev.weather_modifier) {
    reasons.push({
      label:
        curr.weather_modifier > prev.weather_modifier
          ? "Weather turned adverse"
          : "Weather cleared",
      weight: Math.abs(curr.weather_modifier - prev.weather_modifier),
    });
  }

  if (curr.waterlogging_flag !== prev.waterlogging_flag) {
    reasons.push({
      label: curr.waterlogging_flag
        ? "Waterlogging risk appeared"
        : "Waterlogging risk cleared",
      weight: 10,
    });
  }

  const currNews = curr.news_flags?.length ?? 0;
  const prevNews = prev.news_flags?.length ?? 0;
  if (currNews !== prevNews) {
    reasons.push({
      label:
        currNews > prevNews
          ? "New incident reports nearby"
          : "Incident reports cleared",
      weight: Math.abs(currNews - prevNews) * 5,
    });
  }

  if (!reasons.length) return "No single signal drove the change";
  return reasons.sort((a, b) => b.weight - a.weight)[0].label;
}

function segmentDiffs(curr: SafetySnapshot, prev: SafetySnapshot) {
  const prevById = new Map(prev.route.segments.map((s) => [s.segment_id, s]));

  return curr.route.segments
    .map((segment) => {
      const before = prevById.get(segment.segment_id);
      if (!before) return null;

      const delta =
        Math.round((segment.final_score - before.final_score) * 10) / 10;
      if (delta === 0) return null;

      return { segment, delta, reason: explainDelta(segment, before) };
    })
    .filter(
      (item): item is { segment: RouteSegment; delta: number; reason: string } =>
        item !== null,
    )
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
}

/** Data-derived category tag for a corridor card — no fabricated fields. */
function corridorTag(commute: SavedCommute, snapshot: SafetySnapshot | null) {
  if (snapshot?.waterloggingActive)
    return { label: "Active monsoon advisory", tone: P.orange };
  if (snapshot && snapshot.route.route_total_risk >= 75)
    return { label: "High cautionary corridor", tone: P.red };
  if (commute.favorite)
    return { label: "Priority corridor", tone: P.accentDeep };
  if (commute.recurring)
    return { label: "Recurring corridor", tone: P.green };
  return { label: "Saved corridor", tone: P.inkSoft };
}

/* ---------------------------------------------------------- */
/* Small presentational pieces                                 */
/* ---------------------------------------------------------- */

function StatTile({
  label,
  value,
  sub,
  trend,
}: {
  label: string;
  value: string;
  sub: string;
  trend?: { positive: boolean; text: string };
}) {
  return (
    <div
      className="rounded-2xl border p-5"
      style={{ borderColor: P.line, background: P.surface }}
    >
      <p
        className="text-[10px] font-medium uppercase tracking-[0.14em]"
        style={{ color: P.inkSoft }}
      >
        {label}
      </p>
      <div className="mt-3 flex items-baseline gap-2">
        <span
          className="text-3xl font-semibold tracking-tight"
          style={{ color: P.ink }}
        >
          {value}
        </span>
        {trend && (
          <span
            className="text-xs font-medium"
            style={{ color: trend.positive ? P.green : P.red }}
          >
            {trend.text}
          </span>
        )}
      </div>
      <p className="mt-1 text-xs" style={{ color: P.inkSoft }}>
        {sub}
      </p>
    </div>
  );
}

function PillTab({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border px-4 py-1.5 text-xs font-medium transition-colors"
      style={
        active
          ? { background: P.ink, borderColor: P.ink, color: P.surface }
          : { background: P.surface, borderColor: P.line, color: P.inkSoft }
      }
    >
      {label} ({count})
    </button>
  );
}

function CorridorCard({
  commute,
  index,
  checking,
  renaming,
  nameDraft,
  onNameDraftChange,
  onCheck,
  onOpen,
  onRenameStart,
  onRenameCommit,
  onDelete,
  onExport,
}: {
  commute: SavedCommute;
  index: number;
  checking: boolean;
  renaming: boolean;
  nameDraft: string;
  onNameDraftChange: (v: string) => void;
  onCheck: () => void;
  onOpen: () => void;
  onRenameStart: () => void;
  onRenameCommit: () => void;
  onDelete: () => void;
  onExport: () => void;
}) {
  const snapshot = latest(commute);
  const previous = previousOf(commute);
  const tag = corridorTag(commute, snapshot);

  const highest =
    snapshot?.route.segments.reduce<RouteSegment | null>(
      (best, seg) => (!best || seg.final_score > best.final_score ? seg : best),
      null,
    ) ?? null;

  const topChange =
    snapshot && previous ? segmentDiffs(snapshot, previous)[0] ?? null : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      className="rounded-[1.75rem] border p-6"
      style={{ borderColor: P.line, background: P.surface }}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-[0.12em]"
          style={{ background: `${tag.tone}1A`, color: tag.tone }}
        >
          <span className="size-1.5 rounded-full" style={{ background: tag.tone }} />
          {tag.label}
        </span>

        {snapshot && (
          <span
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold"
            style={{
              borderColor: riskTone(snapshot.route.route_total_risk),
              color: riskTone(snapshot.route.route_total_risk),
            }}
          >
            <span
              className="size-1.5 rounded-full"
              style={{ background: riskTone(snapshot.route.route_total_risk) }}
            />
            {snapshot.route.route_total_risk} / 100 · {riskName(snapshot.route.route_total_risk)}
          </span>
        )}
      </div>

      {renaming ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <input
            autoFocus
            value={nameDraft}
            onChange={(e) => onNameDraftChange(e.target.value)}
            className="min-w-[220px] flex-1 rounded-xl border px-3 py-2 text-lg outline-none"
            style={{ borderColor: P.line, color: P.ink }}
          />
          <button
            type="button"
            onClick={onRenameCommit}
            className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-medium"
            style={{ background: P.ink, color: P.surface }}
          >
            <Check size={14} />
            Save
          </button>
        </div>
      ) : (
        <h3
          className="mt-4 text-xl font-semibold leading-snug tracking-tight"
          style={{ color: P.ink }}
        >
          {commute.name}
        </h3>
      )}

      <p className="mt-1 flex items-center gap-1.5 text-sm" style={{ color: P.inkSoft }}>
        <MapPinned size={13} />
        {commute.origin} → {commute.destination}
      </p>

      {snapshot ? (
        <>
          <div
            className="mt-5 grid grid-cols-3 gap-3 rounded-2xl p-4 text-xs"
            style={{ background: P.surfaceAlt }}
          >
            <div>
              <p className="uppercase tracking-[0.1em]" style={{ color: P.inkFaint }}>
                Checked
              </p>
              <p className="mt-1 font-medium" style={{ color: P.ink }}>
                {age(snapshot.checkedAt)}
              </p>
            </div>
            <div>
              <p className="uppercase tracking-[0.1em]" style={{ color: P.inkFaint }}>
                Signals
              </p>
              <p className="mt-1 font-medium" style={{ color: P.ink }}>
                {snapshot.activeSignals} active
              </p>
            </div>
            <div>
              <p className="uppercase tracking-[0.1em]" style={{ color: P.inkFaint }}>
                Highest risk
              </p>
              <p className="mt-1 truncate font-medium" style={{ color: P.ink }}>
                {highest ? `${highest.road_name}` : "—"}
              </p>
            </div>
          </div>

          {snapshot.waterloggingActive ? (
            <div
              className="mt-4 flex gap-3 rounded-2xl border p-4"
              style={{ borderColor: `${P.orange}33`, background: `${P.orange}10` }}
            >
              <AlertTriangle size={16} className="mt-0.5 shrink-0" style={{ color: P.orange }} />
              <p className="text-xs leading-5" style={{ color: P.ink }}>
                <span className="font-semibold">Waterlogging signal active.</span>{" "}
                This corridor is showing standing-water risk on the latest check —
                consider reviewing an alternate before departure.
              </p>
            </div>
          ) : topChange && Math.abs(topChange.delta) >= 3 ? (
            <div
              className="mt-4 flex items-start justify-between gap-3 rounded-2xl border p-4"
              style={{ borderColor: P.line, background: P.surfaceAlt }}
            >
              <div className="flex gap-3">
                <ShieldCheck size={16} className="mt-0.5 shrink-0" style={{ color: P.accentDeep }} />
                <div>
                  <p className="text-xs font-medium" style={{ color: P.ink }}>
                    {topChange.segment.road_name}
                  </p>
                  <p className="mt-0.5 text-xs leading-5" style={{ color: P.inkSoft }}>
                    {topChange.reason}
                  </p>
                </div>
              </div>
              <span
                className="flex shrink-0 items-center gap-1 text-sm font-semibold"
                style={{ color: topChange.delta > 0 ? P.red : P.green }}
              >
                {topChange.delta > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {topChange.delta > 0 ? "+" : ""}
                {topChange.delta}
              </span>
            </div>
          ) : (
            <div
              className="mt-4 flex gap-3 rounded-2xl border p-4"
              style={{ borderColor: P.line, background: P.surfaceAlt }}
            >
              <ShieldCheck size={16} className="mt-0.5 shrink-0" style={{ color: P.green }} />
              <p className="text-xs leading-5" style={{ color: P.inkSoft }}>
                No meaningful change since the last check — this corridor is
                behaving consistently.
              </p>
            </div>
          )}
        </>
      ) : (
        <div
          className="mt-5 rounded-2xl border p-4 text-xs leading-5"
          style={{ borderColor: P.line, background: P.surfaceAlt, color: P.inkSoft }}
        >
          No safety check recorded yet. Run “Check now” to establish a baseline.
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={checking}
          onClick={onCheck}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium disabled:opacity-50"
          style={{ background: P.ink, color: P.surface }}
        >
          <RefreshCw size={14} className={checking ? "animate-spin" : ""} />
          {checking ? "Checking…" : "Check now"}
        </button>

        <button
          type="button"
          onClick={onOpen}
          className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium"
          style={{ borderColor: P.line, color: P.ink }}
        >
          <MapPinned size={14} />
          Open route
        </button>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            title="Rename"
            onClick={onRenameStart}
            className="rounded-lg p-2 transition-colors hover:bg-black/5"
            style={{ color: P.inkSoft }}
          >
            <Pencil size={15} />
          </button>
          <button
            type="button"
            title="Export safety report"
            onClick={onExport}
            className="rounded-lg p-2 transition-colors hover:bg-black/5"
            style={{ color: P.inkSoft }}
          >
            <Download size={15} />
          </button>
          <button
            type="button"
            title="Delete"
            onClick={onDelete}
            className="rounded-lg p-2 transition-colors hover:bg-black/5"
            style={{ color: P.red }}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ---------------------------------------------------------- */
/* Page                                                         */
/* ---------------------------------------------------------- */

type FilterKey = "all" | "favorites" | "recurring" | "elevated";

export default function SavedCorridorsCommuteArchive() {
  const {
    savedCommutes,
    refreshSavedCommute,
    openSavedCommute,
    renameSavedCommute,
    deleteSavedCommute,
    loading,
  } = useRouteContext();

  const navigate = useNavigate();

  const [filter, setFilter] = useState<FilterKey>("all");
  const [checkingId, setCheckingId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [nameDraft, setNameDraft] = useState("");

  useEffect(() => {
    document.title = "Saved Commutes | SafeRoute Telangana";
  }, []);

  const counts = useMemo(
    () => ({
      all: savedCommutes.length,
      favorites: savedCommutes.filter((c) => c.favorite).length,
      recurring: savedCommutes.filter((c) => c.recurring).length,
      elevated: savedCommutes.filter(
        (c) => (latest(c)?.route.route_total_risk ?? 0) >= 50,
      ).length,
    }),
    [savedCommutes],
  );

  const visibleCommutes = useMemo(() => {
    switch (filter) {
      case "favorites":
        return savedCommutes.filter((c) => c.favorite);
      case "recurring":
        return savedCommutes.filter((c) => c.recurring);
      case "elevated":
        return savedCommutes.filter(
          (c) => (latest(c)?.route.route_total_risk ?? 0) >= 50,
        );
      default:
        return savedCommutes;
    }
  }, [savedCommutes, filter]);

  const snapshotsWithCommute = useMemo(
    () =>
      savedCommutes
        .flatMap((c) =>
          c.snapshots.map((snap, i) => ({
            commute: c,
            snapshot: snap,
            previous: i > 0 ? c.snapshots[i - 1] : null,
          })),
        )
        .sort(
          (a, b) =>
            new Date(b.snapshot.checkedAt).getTime() -
            new Date(a.snapshot.checkedAt).getTime(),
        ),
    [savedCommutes],
  );

  const latestRisks = savedCommutes
    .map((c) => latest(c)?.route.route_total_risk)
    .filter((v): v is number => v !== undefined);

  const previousRisks = savedCommutes
    .map((c) => previousOf(c)?.route.route_total_risk)
    .filter((v): v is number => v !== undefined);

  const avgRisk = latestRisks.length
    ? Math.round(
        (latestRisks.reduce((a, b) => a + b, 0) / latestRisks.length) * 10,
      ) / 10
    : null;

  const avgPrevRisk = previousRisks.length
    ? previousRisks.reduce((a, b) => a + b, 0) / previousRisks.length
    : null;

  const riskDelta =
    avgRisk !== null && avgPrevRisk !== null
      ? Math.round((avgRisk - avgPrevRisk) * 10) / 10
      : null;

  const totalActiveSignals = savedCommutes.reduce(
    (sum, c) => sum + (latest(c)?.activeSignals ?? 0),
    0,
  );

  const highestOverall = savedCommutes.reduce<{
    commute: SavedCommute;
    score: number;
  } | null>((best, c) => {
    const score = latest(c)?.route.route_total_risk;
    if (score === undefined) return best;
    return !best || score > best.score ? { commute: c, score } : best;
  }, null);

  const totalChecks = savedCommutes.reduce((s, c) => s + c.snapshots.length, 0);

  const checkNow = async (id: string) => {
    setCheckingId(id);
    try {
      await refreshSavedCommute(id);
    } finally {
      setCheckingId(null);
    }
  };

  const openRoute = (id: string) => {
    if (openSavedCommute(id)) navigate("/route");
  };

  const remove = (commute: SavedCommute) => {
    if (
      window.confirm(
        `Delete "${commute.name}" and its locally stored safety history?`,
      )
    ) {
      deleteSavedCommute(commute.id);
    }
  };

  const beginRename = (commute: SavedCommute) => {
    setNameDraft(commute.name);
    setRenamingId(commute.id);
  };

  const commitRename = (id: string) => {
    if (nameDraft.trim()) renameSavedCommute(id, nameDraft);
    setRenamingId(null);
  };

  const exportCommute = (commute: SavedCommute) => {
    const snap = latest(commute);
    if (!snap) return;
    downloadSafetyReport(
      commute.origin,
      commute.destination,
      snap.route,
      `SafeRoute — ${commute.name}`,
    );
  };

  const exportAudit = () => {
    const target = visibleCommutes[0] ?? savedCommutes[0];
    if (target) exportCommute(target);
  };

  if (!savedCommutes.length) {
    return (
      <div className="min-h-screen pt-20" style={{ background: P.bg }}>
        <div className={`${shell} py-24`}>
          <section
            className="mx-auto max-w-2xl overflow-hidden rounded-[2rem] border p-12 text-center"
            style={{ borderColor: P.line, background: P.surface }}
          >
            <div
              className="mx-auto flex size-16 items-center justify-center rounded-2xl"
              style={{ background: P.accent, color: P.ink }}
            >
              <Bookmark size={28} />
            </div>

            <p
              className="mt-7 text-[10px] uppercase tracking-[0.2em]"
              style={{ color: P.accentDeep }}
            >
              Commute intelligence
            </p>

            <h1 className="mt-3 text-4xl font-semibold tracking-tight" style={{ color: P.ink }}>
              Nothing saved yet.
            </h1>

            <p className="mx-auto mt-5 max-w-lg leading-7" style={{ color: P.inkSoft }}>
              Save a route you travel regularly and SafeRoute will retain its
              safety checks so you can see how that corridor changes over time.
            </p>

            <Link
              to="/route-planner"
              className="mt-8 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium"
              style={{ background: P.accent, color: P.ink }}
            >
              <Route size={16} />
              Plan a route
            </Link>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 pt-20" style={{ background: P.bg }}>
      <div className={shell}>
        {/* EYEBROW */}
        <div className="flex flex-wrap items-center gap-3 pt-2 pb-6">
          <span
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em]"
            style={{ borderColor: P.line, color: P.accentDeep, background: P.surface }}
          >
            <span className="size-1.5 rounded-full" style={{ background: P.accent }} />
            Commute AI engine active
          </span>
          <span className="text-[10px] uppercase tracking-[0.16em]" style={{ color: P.inkFaint }}>
            Personal road-safety intelligence
          </span>
        </div>

        {/* HEADER */}
        <header
          className="flex flex-col gap-7 border-b pb-10 lg:flex-row lg:items-end lg:justify-between"
          style={{ borderColor: P.line }}
        >
          <div>
            <h1
              className="max-w-3xl text-4xl font-semibold leading-[1.05] tracking-[-0.03em] md:text-5xl"
              style={{ color: P.ink }}
            >
              Monitored Commutes &{" "}
              <span className="font-serif italic" style={{ color: P.accent }}>
                Route Guardians
              </span>
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7" style={{ color: P.inkSoft }}>
              Your recurring corridors, continuously re-checkable against the
              latest available safety signals.
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap gap-3">
            <button
              type="button"
              onClick={exportAudit}
              className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium"
              style={{ borderColor: P.line, color: P.ink, background: P.surface }}
            >
              <Download size={15} />
              Export safety audit
            </button>

            <Link
              to="/route-planner"
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium"
              style={{ background: P.accent, color: P.ink }}
            >
              <Route size={15} />
              Track new corridor
            </Link>
          </div>
        </header>

        {/* FILTER TABS */}
        <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <PillTab active={filter === "all"} label="All monitored" count={counts.all} onClick={() => setFilter("all")} />
            <PillTab active={filter === "favorites"} label="Favourites" count={counts.favorites} onClick={() => setFilter("favorites")} />
            <PillTab active={filter === "recurring"} label="Recurring" count={counts.recurring} onClick={() => setFilter("recurring")} />
            <PillTab active={filter === "elevated"} label="Elevated risk" count={counts.elevated} onClick={() => setFilter("elevated")} />
          </div>

          <span className="text-xs" style={{ color: P.inkFaint }}>
            Showing {visibleCommutes.length} of {savedCommutes.length} corridors
          </span>
        </div>

        {/* STAT TILES */}
        <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile
            label="Active corridors"
            value={`${savedCommutes.length}`}
            sub={savedCommutes.map((c) => c.name).slice(0, 2).join(", ") || "—"}
          />
          <StatTile
            label="Average safety index"
            value={avgRisk !== null ? `${avgRisk}` : "—"}
            sub="/ 100 risk, across all corridors"
            trend={
              riskDelta !== null
                ? {
                    positive: riskDelta <= 0,
                    text: `${riskDelta > 0 ? "+" : ""}${riskDelta}`,
                  }
                : undefined
            }
          />
          <StatTile
            label="Active signals"
            value={`${totalActiveSignals}`}
            sub="Segments currently carrying a safety signal"
          />
          <StatTile
            label="Highest exposure"
            value={highestOverall ? `${highestOverall.score}` : "—"}
            sub={highestOverall ? highestOverall.commute.name : "No data yet"}
          />
        </section>

        {/* CORRIDOR GRID */}
        <section className="mt-10">
          <div className="flex items-end justify-between">
            <div>
              <span
                className="text-[10px] uppercase tracking-[0.18em]"
                style={{ color: P.accentDeep }}
              >
                Saved corridor guardians
              </span>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight" style={{ color: P.ink }}>
                Continuous polyline evaluations for every saved corridor
              </h2>
            </div>
          </div>

          {visibleCommutes.length ? (
            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              {visibleCommutes.map((item, index) => (
                <CorridorCard
                  key={item.id}
                  commute={item}
                  index={index}
                  checking={checkingId === item.id || (loading && checkingId === item.id)}
                  renaming={renamingId === item.id}
                  nameDraft={nameDraft}
                  onNameDraftChange={setNameDraft}
                  onCheck={() => checkNow(item.id)}
                  onOpen={() => openRoute(item.id)}
                  onRenameStart={() => beginRename(item)}
                  onRenameCommit={() => commitRename(item.id)}
                  onDelete={() => remove(item)}
                  onExport={() => exportCommute(item)}
                />
              ))}
            </div>
          ) : (
            <div
              className="mt-6 rounded-2xl border p-8 text-center text-sm"
              style={{ borderColor: P.line, background: P.surface, color: P.inkSoft }}
            >
              No corridors match this filter.
            </div>
          )}
        </section>

        {/* HISTORY + SIDEBAR */}
        <section className="mt-10 grid gap-6 lg:grid-cols-12">
          <div
            className="rounded-[2rem] border p-7 lg:col-span-8 lg:p-9"
            style={{ borderColor: P.line, background: P.surface }}
          >
            <div className="flex items-center gap-2">
              <History size={16} style={{ color: P.accentDeep }} />
              <span
                className="text-[10px] uppercase tracking-[0.18em]"
                style={{ color: P.accentDeep }}
              >
                Verified trips
              </span>
            </div>

            <h3 className="mt-3 text-2xl font-semibold tracking-tight" style={{ color: P.ink }}>
              Historical commute safety log
            </h3>

            {snapshotsWithCommute.length ? (
              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr
                      className="text-[10px] uppercase tracking-[0.1em]"
                      style={{ color: P.inkFaint }}
                    >
                      <th className="pb-3 pr-4 font-medium">Date & time</th>
                      <th className="pb-3 pr-4 font-medium">Corridor</th>
                      <th className="pb-3 pr-4 font-medium">Delta</th>
                      <th className="pb-3 pr-4 font-medium">Top signal</th>
                      <th className="pb-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {snapshotsWithCommute.slice(0, 8).map(({ commute, snapshot, previous }, i) => {
                      const delta = previous
                        ? Math.round(
                            (snapshot.route.route_total_risk -
                              previous.route.route_total_risk) *
                              10,
                          ) / 10
                        : null;

                      const topReason =
                        previous && segmentDiffs(snapshot, previous)[0]?.reason;

                      return (
                        <tr
                          key={snapshot.id ?? i}
                          className="border-t"
                          style={{ borderColor: P.line }}
                        >
                          <td className="py-3 pr-4 whitespace-nowrap" style={{ color: P.inkSoft }}>
                            {shortDateTime(snapshot.checkedAt)}
                          </td>
                          <td className="py-3 pr-4 font-medium" style={{ color: P.ink }}>
                            {commute.name}
                          </td>
                          <td className="py-3 pr-4">
                            {delta !== null ? (
                              <span
                                className="inline-flex items-center gap-1 font-semibold"
                                style={{ color: delta > 0 ? P.red : delta < 0 ? P.green : P.inkSoft }}
                              >
                                {delta > 0 ? <ArrowUpRight size={12} /> : delta < 0 ? <ArrowDownRight size={12} /> : null}
                                {delta > 0 ? "+" : ""}
                                {delta}
                              </span>
                            ) : (
                              <span style={{ color: P.inkFaint }}>Baseline</span>
                            )}
                          </td>
                          <td className="py-3 pr-4" style={{ color: P.inkSoft }}>
                            {topReason ?? "First recorded check"}
                          </td>
                          <td className="py-3">
                            <span
                              className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.08em]"
                              style={
                                delta === null || delta <= 0
                                  ? { background: `${P.green}1A`, color: P.green }
                                  : { background: `${P.orange}1A`, color: P.orange }
                              }
                            >
                              {delta === null || delta <= 0 ? "Protected" : "Elevated"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-6 text-sm" style={{ color: P.inkSoft }}>
                No checks recorded yet.
              </p>
            )}

            <div
              className="mt-7 flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-5"
              style={{ borderColor: P.line, background: P.surfaceAlt }}
            >
              <div>
                <p className="text-[9px] uppercase tracking-[0.15em]" style={{ color: P.inkFaint }}>
                  Aggregate exposure
                </p>
                <p className="mt-1 text-sm font-medium" style={{ color: P.ink }}>
                  {totalChecks} safety check{totalChecks === 1 ? "" : "s"} recorded across{" "}
                  {savedCommutes.length} corridor{savedCommutes.length === 1 ? "" : "s"}
                </p>
              </div>
              {riskDelta !== null && (
                <span
                  className="text-lg font-semibold"
                  style={{ color: riskDelta <= 0 ? P.green : P.red }}
                >
                  {riskDelta > 0 ? "+" : ""}
                  {riskDelta}
                </span>
              )}
            </div>
          </div>

          <aside
            className="rounded-[2rem] p-7 lg:col-span-4 lg:p-8"
            style={{ background: P.ink, color: P.surface }}
          >
            <span
              className="text-[10px] uppercase tracking-[0.18em]"
              style={{ color: P.accent }}
            >
              Corridor provisioning
            </span>

            <h3 className="mt-3 text-2xl font-semibold tracking-tight">
              How corridors are monitored
            </h3>

            <p className="mt-4 text-sm leading-6 text-white/55">
              Every route you track is re-checked against traffic, road-surface,
              weather and news signals each time you run “Check now,” and the
              result is kept as a permanent local safety history.
            </p>

            <div className="mt-7 space-y-5">
              <div className="flex items-start gap-3">
                <CarFront size={16} className="mt-0.5 shrink-0" style={{ color: P.accent }} />
                <div>
                  <p className="text-sm font-medium">Traffic conditions</p>
                  <p className="mt-1 text-xs leading-5 text-white/45">
                    Live congestion state feeds directly into each segment's score.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Droplets size={16} className="mt-0.5 shrink-0" style={{ color: P.accent }} />
                <div>
                  <p className="text-sm font-medium">Waterlogging signal</p>
                  <p className="mt-1 text-xs leading-5 text-white/45">
                    Flagged corridors surface an advisory on their card.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Newspaper size={16} className="mt-0.5 shrink-0" style={{ color: P.accent }} />
                <div>
                  <p className="text-sm font-medium">Nearby incident reports</p>
                  <p className="mt-1 text-xs leading-5 text-white/45">
                    News-derived flags are counted per snapshot for context.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Activity size={16} className="mt-0.5 shrink-0" style={{ color: P.accent }} />
                <div>
                  <p className="text-sm font-medium">Road-surface detections</p>
                  <p className="mt-1 text-xs leading-5 text-white/45">
                    Vision-based severity readings roll up into active signals.
                  </p>
                </div>
              </div>
            </div>

            <Link
              to="/route-planner"
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium"
              style={{ background: P.accent, color: P.ink }}
            >
              <Route size={15} />
              Set up new tracked route
            </Link>
          </aside>
        </section>

        {/* FOOTER META */}
        <div
          className="mt-10 flex flex-col gap-3 border-t pt-6 text-xs md:flex-row md:items-center md:justify-between"
          style={{ borderColor: P.line, color: P.inkSoft }}
        >
          <span>Saved locally on this device · no account required</span>
          <span>
            {totalChecks} safety check{totalChecks === 1 ? "" : "s"} recorded
          </span>
        </div>
      </div>
    </div>
  );
}