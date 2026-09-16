//frontend/src/components/SegmentDetailDrawer.tsx
import { useState } from "react";
import { X, AlertTriangle, ChevronsLeft, ChevronsRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { RouteSegment } from "../types/route";
import { explainSegment, bandFor, scoreArithmetic } from "../services/riskNarrative";
import SegmentRiskBadge from "./SegmentRiskBadge";
import RoadDamageImage from "./RoadDamageImage";
import "./SegmentDetailDrawer.css";

interface Props {
  segment: RouteSegment | null;
  onClose: () => void;
}

const DRAWER_WIDTH_NORMAL = "420px";
const DRAWER_WIDTH_EXPANDED = "760px";

const SegmentDetailDrawer = ({ segment, onClose }: Props) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => {
    setExpanded((prev) => !prev);
    setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 400);
  };

  return (
    <AnimatePresence>
      {segment && (
        <motion.div 
          className="drawer-overlay open" 
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="drawer-panel" 
            onClick={(e) => e.stopPropagation()}
            initial={{ x: "100%" }}
            animate={{ x: 0, width: expanded ? DRAWER_WIDTH_EXPANDED : DRAWER_WIDTH_NORMAL }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            style={{ maxWidth: "94vw" }}
          >
            <div className="drawer-header flex justify-between items-center">
              <div>
                <h3 className="drawer-title">{segment.road_name}</h3>
                <p className="text-muted" style={{ fontSize: '0.875rem' }}>Segment ID: {segment.segment_id}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="btn-icon"
                  onClick={toggleExpanded}
                  aria-label={expanded ? "Collapse panel" : "Expand panel"}
                  title={expanded ? "Collapse panel" : "Expand panel"}
                >
                  {expanded ? <ChevronsRight size={22} /> : <ChevronsLeft size={22} />}
                </button>
                <button className="btn-icon" onClick={onClose}>
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="drawer-content">
              <div className="card risk-card">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold">Risk Factor</span>
                  <SegmentRiskBadge score={segment.final_score} size="lg" />
                </div>
                
                <div className="stat-number text-center mb-2">{segment.final_score}</div>
                <p className="text-center font-semibold text-dark-grey" style={{ fontSize: '0.8rem' }}>
                  {bandFor(segment.final_score).band} — {bandFor(segment.final_score).headline}
                </p>
                <p className="text-center text-muted mt-1" style={{ fontSize: '0.7rem' }}>{scoreArithmetic(segment)}</p>
                <p className="text-dark-grey mt-3" style={{ fontSize: '0.8rem', lineHeight: 1.6 }}>{explainSegment(segment)}</p>
                <p className="text-center text-muted mt-2" style={{ fontSize: '0.75rem' }}>Source: fused route risk pipeline</p>
                
                <div className="risk-breakdown mt-6">
                  <div className="breakdown-item">
                    <span className="label">Historical Data</span>
                    <span className="text-muted" style={{ fontSize: '0.7rem' }}>Source: IIT Delhi crash dataset</span>
                    <div className="bar-bg">
                      <motion.div className="bar-fill" initial={{ width: 0 }} animate={{ width: `${segment.historical_score}%` }} transition={{ duration: 1, delay: 0.2 }} />
                    </div>
                  </div>
                  <div className="breakdown-item">
                    <span className="label">Traffic ({segment.traffic_status === "unavailable" ? "feed unavailable" : segment.traffic_level})</span>
                    <span className="text-muted" style={{ fontSize: '0.7rem' }}>Source: {segment.traffic_status === "unavailable" ? "TomTom feed unavailable — no score contribution" : "TomTom live traffic"}</span>
                    <div className="bar-bg">
                      <motion.div className="bar-fill" initial={{ width: 0 }} animate={{ width: segment.traffic_status === "unavailable" ? '0%' : segment.traffic_level === 'severe' ? '90%' : segment.traffic_level === 'high' ? '70%' : segment.traffic_level === 'medium' ? '50%' : '30%' }} transition={{ duration: 1, delay: 0.3 }} />
                    </div>
                  </div>
                  {segment.waterlogging_flag && (
                    <div className="breakdown-item">
                      <span className="label">Waterlogging</span>
                      <span className="text-muted" style={{ fontSize: '0.7rem' }}>Source: Open-Meteo / municipal drainage signal</span>
                      <div className="bar-bg">
                        <motion.div className="bar-fill" style={{ backgroundColor: 'var(--risk-high)' }} initial={{ width: 0 }} animate={{ width: '80%' }} transition={{ duration: 1, delay: 0.4 }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {(segment.vision_severity !== "none" || segment.image_url) && (
                <div className="card mt-4 damage-card">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={20} color="var(--risk-severe)" />
                    <span className="font-semibold">Road Damage Detected</span>
                  </div>
                  
                  <div className={`damage-info flex gap-4 mt-4 ${expanded ? "flex-row" : "flex-col sm:flex-row"}`}>
                    {segment.image_url && (
                      <div className="damage-thumbnail-wrapper" style={expanded ? { width: "220px", flexShrink: 0 } : undefined}>
                        <RoadDamageImage src={segment.image_url} alt="Road damage detection source" className={expanded ? "aspect-[4/3] w-full" : "aspect-[4/3] w-32"}>
                        {segment.vision_source === "rdd2022_sample" && (
                          <span className="sample-label">Sample Image</span>
                        )}
                        </RoadDamageImage>
                      </div>
                    )}
                    <div>
                      <span className="pill risk-severe size-sm mb-2">Severity: {segment.vision_severity}</span>
                      <p className="text-sm text-dark-grey">YOLOv8 detected surface anomalies on this route segment.</p>
                      <p className="text-muted mt-1" style={{ fontSize: '0.75rem' }}>Source: {segment.vision_source === "rdd2022_sample" ? "YOLOv8 / RDD2022 fallback" : "YOLOv8 street-level vision"}</p>
                    </div>
                  </div>
                </div>
              )}

              {segment.news_flags && segment.news_flags.length > 0 && (
                <div className="card mt-4 news-card">
                  <h4 className="mb-2">Live News Reports</h4>
                  <p className="text-muted mb-2" style={{ fontSize: '0.75rem' }}>Source: Google News RSS</p>
                  <ul className="news-list">
                    {segment.news_flags.map((news, i) => (
                      <motion.li 
                        key={i} 
                        className="text-sm text-dark-grey"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + (i * 0.1) }}
                      >
                        {news}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SegmentDetailDrawer;