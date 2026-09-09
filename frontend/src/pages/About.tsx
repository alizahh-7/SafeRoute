import { motion } from "framer-motion";
import { Database, Eye, Newspaper, ShieldAlert, ArrowDown } from "lucide-react";
import { ASSETS } from "../assets.config";
import "./About.css";

const FlowDiagram = () => (
  <div className="flow-diagram my-16 p-8 bg-white rounded-[32px] shadow-sm border border-grey-light">
    <h3 className="text-2xl mb-8 text-center">Score Computation Flow</h3>
    <div className="flex flex-col items-center">
      <div className="flex gap-4 mb-4">
        <div className="pill bg-grey-light">Historical Data</div>
        <div className="pill bg-grey-light">Live Weather</div>
        <div className="pill bg-grey-light">Traffic</div>
        <div className="pill bg-grey-light">Vision</div>
      </div>
      
      <motion.div 
        initial={{ height: 0 }}
        whileInView={{ height: 40 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="w-1 bg-black mb-4"
      />
      
      <div className="card bg-black text-white px-8 py-4 mb-4 z-10 text-xl font-bold">
        Fusion Engine
      </div>
      
      <motion.div 
        initial={{ height: 0 }}
        whileInView={{ height: 40 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
        className="w-1 bg-black mb-4 relative"
      >
        <ArrowDown size={24} className="absolute -bottom-4 left-[-10px]" />
      </motion.div>
      
      <div className="card border-2 border-risk-high text-risk-high px-8 py-4 z-10 text-2xl font-bold mt-4">
        Final Segment Risk Score
      </div>
    </div>
  </div>
);

const About = () => {
  const itemVariants: any = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="about-page">
      {/* Hero */}
      <section className="section-padding bg-black text-white full-bleed text-center">
        <div className="container max-w-3xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl mb-6 text-white"
          >
            The intelligence behind the route.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-grey-muted"
          >
            SafeRoute is an AI-powered safety layer that augments traditional navigation. By combining multiple data streams into a single risk score, we help you make informed decisions before you drive.
          </motion.p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container max-w-4xl mx-auto">
          
          <FlowDiagram />

          <h2 className="text-4xl mb-12 text-center mt-24">Data Sources in Depth</h2>

          <div className="grid gap-16">
            <motion.div variants={itemVariants} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1">
                <div className="icon-box bg-grey-light mb-4"><Database size={24} /></div>
                <h3 className="text-2xl mb-2">Historical Crash Data</h3>
                <p className="text-sm text-grey-dark font-mono mb-4">Dataset: IIT Delhi Mendeley · 114 Rows (Telangana)</p>
                <p className="text-dark-grey text-lg">
                  We use verified accident data to identify foundational blackspots. Severity is computed via a weighted formula (killed×5 + injured×1) to establish the base risk of any road segment before live factors are applied.
                </p>
              </div>
              <div className="flex-1">
                <img src={ASSETS.images.historicalData} alt="Data" className="rounded-[24px] shadow-xl w-full h-64 object-cover" />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} className="flex flex-col md:flex-row-reverse gap-8 items-center">
              <div className="flex-1">
                <div className="icon-box bg-grey-light mb-4"><Eye size={24} /></div>
                <h3 className="text-2xl mb-2">AI Road Damage Detection</h3>
                <p className="text-sm text-grey-dark font-mono mb-4">Model: YOLOv8 · Training: RDD2022 India Subset</p>
                <p className="text-dark-grey text-lg">
                  Our vision model detects potholes and surface cracks from crowdsourced dashcam feeds, classifying severity into 4 levels. This acts as an active penalty on the base score.
                </p>
              </div>
              <div className="flex-1">
                <img src={ASSETS.images.aiVision} alt="Vision" className="rounded-[24px] shadow-xl w-full h-64 object-cover" />
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1">
                <div className="icon-box bg-grey-light mb-4"><Newspaper size={24} /></div>
                <h3 className="text-2xl mb-2">Live News Advisory</h3>
                <p className="text-sm text-grey-dark font-mono mb-4">Source: Google News RSS · Cadence: Near Real-time</p>
                <p className="text-dark-grey text-lg">
                  We parse local news feeds for keywords related to protests, major closures, or severe waterlogging. If relevant news intersects with your route, the system actively prompts a reroute.
                </p>
              </div>
              <div className="flex-1">
                <img src={ASSETS.images.newsAdvisory} alt="News" className="rounded-[24px] shadow-xl w-full h-64 object-cover" />
              </div>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="card bg-grey-light mt-24 limitations-card"
          >
            <div className="flex items-center gap-2 mb-4">
              <ShieldAlert size={20} color="var(--risk-high)" />
              <h3 className="text-xl">System Limitations</h3>
            </div>
            <ul className="text-base text-dark-grey list-disc pl-5 space-y-2">
              <li><strong>Data Coverage:</strong> Historical data is currently constrained to available open datasets specifically filtered for the Telangana region.</li>
              <li><strong>Vision Model Constraints:</strong> YOLOv8 accuracy depends heavily on lighting conditions and camera angles from the available video feeds.</li>
              <li><strong>Real-time Latency:</strong> RSS news scraping has an inherent delay and may not capture hyper-local incidents the exact minute they occur.</li>
            </ul>
          </motion.div>
        </div>
      </section>
      
      {/* Footer / Stack */}
      <section className="section-padding border-t border-grey-light mt-12">
        <div className="container text-center">
          <h3 className="text-xl mb-6">Powered By</h3>
          <div className="flex flex-wrap justify-center gap-4">
            {['OpenRouteService', 'YOLOv8', 'Nominatim', 'Google News RSS', 'React', 'Framer Motion', 'Three.js'].map((tech) => (
              <span key={tech} className="pill bg-white border border-grey-light shadow-sm px-4 py-2 text-sm font-semibold">{tech}</span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
