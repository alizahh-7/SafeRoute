import { motion } from "framer-motion";
import type { RouteSegment } from "../types/route";
import "./NewsAdvisoryModal.css";

interface Props {
  segment: RouteSegment | null;
  onContinue: () => void;
  onReroute: () => void;
}

const NewsAdvisoryModal = ({ segment, onContinue, onReroute }: Props) => {
  if (!segment || !segment.news_flags || segment.news_flags.length === 0) return null;

  return (
    <motion.div 
      className="modal-overlay"
      initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
      animate={{ opacity: 1, backdropFilter: "blur(4px)" }}
      exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
    >
      <motion.div 
        className="modal-content card"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        <h3 className="modal-title mb-4">Advisory near {segment.road_name}</h3>
        
        <div className="modal-body mb-6">
          <ul className="news-list-modal">
            {segment.news_flags.map((news, i) => (
              <motion.li 
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + (i * 0.1) }}
              >
                {news}
              </motion.li>
            ))}
          </ul>
          <p className="text-muted mt-4 text-sm">
            Based on live news reports, this segment may cause significant delays or pose a safety risk.
          </p>
        </div>

        <div className="modal-actions flex flex-col gap-2">
          <button className="btn btn-primary pulse-btn" onClick={onReroute}>
            Show Safer Route
          </button>
          <button className="btn btn-outline" onClick={onContinue}>
            Continue Anyway
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default NewsAdvisoryModal;
