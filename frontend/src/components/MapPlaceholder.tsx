import { motion } from "framer-motion";
import type { RouteSegment } from "../types/route";
import "./MapPlaceholder.css";

interface Props {
  segments: RouteSegment[];
  alternate?: boolean;
}

const MapPlaceholder = ({ alternate = false }: Props) => {
  return (
    <div className="map-container relative w-full h-full bg-[#EFEFEF]">
      <div className="map-tiles absolute inset-0"></div>
      
      <svg className="route-line" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Shadow/Base Line */}
        <motion.path 
          d={alternate ? "M10 90 Q 20 50, 40 40 T 90 10" : "M10 90 Q 30 70, 50 50 T 90 10"} 
          className="route-path-bg" 
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1, d: alternate ? "M10 90 Q 20 50, 40 40 T 90 10" : "M10 90 Q 30 70, 50 50 T 90 10" }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
        
        {/* Risk Highlight Line */}
        <motion.path 
          d={alternate ? "M10 90 Q 20 50, 40 40 T 90 10" : "M10 90 Q 30 70, 50 50 T 90 10"} 
          className="route-path-segments pattern-hatch"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1, d: alternate ? "M10 90 Q 20 50, 40 40 T 90 10" : "M10 90 Q 30 70, 50 50 T 90 10" }}
          transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
        />
      </svg>
      
      {/* 3D Map Pins (simulated with CSS for now) */}
      <motion.div 
        className="absolute bottom-[10%] left-[10%] w-4 h-4 bg-black rounded-full shadow-lg border-2 border-white z-10"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.5, type: "spring" }}
      />
      <motion.div 
        className="absolute top-[10%] right-[10%] w-4 h-4 bg-black rounded-full shadow-lg border-2 border-white z-10"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.6, type: "spring" }}
      />
      
      <div className="absolute top-4 left-4 z-10 bg-white/80 backdrop-blur px-4 py-2 rounded-full font-medium text-grey-dark text-sm border border-white/40 shadow-sm">
        Live Interactive Map (Placeholder)
      </div>
    </div>
  );
};

export default MapPlaceholder;
