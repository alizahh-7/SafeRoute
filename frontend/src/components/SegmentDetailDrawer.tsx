import { X, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { RouteSegment } from "../types/route";
import SegmentRiskBadge from "./SegmentRiskBadge";
import "./SegmentDetailDrawer.css";

interface Props {
  segment: RouteSegment | null;
  onClose: () => void;
}

const SegmentDetailDrawer = ({ segment, onClose }: Props) => {
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
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            <div className="drawer-header flex justify-between items-center">
              <div>
                <h3 className="drawer-title">{segment.road_name}</h3>
                <p className="text-muted" style={{ fontSize: '0.875rem' }}>Segment ID: {segment.segment_id}</p>
              </div>
              <button className="btn-icon" onClick={onClose}>
                <X size={24} />
              </button>
            </div>

            <div className="drawer-content">
              <div className="card risk-card">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold">Risk Factor</span>
                  <SegmentRiskBadge score={segment.final_score} size="lg" />
                </div>
                
                <div className="stat-number text-center mb-2">{segment.final_score}</div>
                <p className="text-center text-dark-grey">{segment.explanation}</p>
                
                <div className="risk-breakdown mt-6">
                  <div className="breakdown-item">
                    <span className="label">Historical Data</span>
                    <div className="bar-bg">
                      <motion.div className="bar-fill" initial={{ width: 0 }} animate={{ width: `${segment.historical_score}%` }} transition={{ duration: 1, delay: 0.2 }} />
                    </div>
                  </div>
                  <div className="breakdown-item">
                    <span className="label">Traffic ({segment.traffic_level})</span>
                    <div className="bar-bg">
                      <motion.div className="bar-fill" initial={{ width: 0 }} animate={{ width: segment.traffic_level === 'severe' ? '90%' : segment.traffic_level === 'high' ? '70%' : '30%' }} transition={{ duration: 1, delay: 0.3 }} />
                    </div>
                  </div>
                  {segment.waterlogging_flag && (
                    <div className="breakdown-item">
                      <span className="label">Waterlogging</span>
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
                  
                  <div className="damage-info flex gap-4 mt-4">
                    {segment.image_url && (
                      <div className="damage-thumbnail-wrapper overflow-hidden rounded-xl">
                        <motion.img 
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.3 }}
                          src={segment.image_url} 
                          alt="Road damage" 
                          className="damage-thumbnail" 
                        />
                        {segment.image_source === "rdd2022_sample" && (
                          <span className="sample-label">Sample Image</span>
                        )}
                      </div>
                    )}
                    <div>
                      <span className="pill risk-severe size-sm mb-2">Severity: {segment.vision_severity}</span>
                      <p className="text-sm text-dark-grey">YOLOv8 detected surface anomalies on this route segment.</p>
                    </div>
                  </div>
                </div>
              )}

              {segment.news_flags && segment.news_flags.length > 0 && (
                <div className="card mt-4 news-card">
                  <h4 className="mb-2">Live News Reports</h4>
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
