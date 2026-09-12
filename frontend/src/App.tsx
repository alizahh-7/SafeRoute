//frontend/src/App.tsx

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import RoutePlanner from "./pages/RoutePlanner";
import RouteResults from "./pages/RouteResults";
import Header from "./components/Header";
import Footer from "./components/Footer";
import About from "./pages/About";
import { SegmentDiagnostics } from "./pages/SegmentAIDiagnosticsRiskBreakdown";
import RealTimeHazardRerouteAdvisory from "./pages/RealTimeHazardRerouteAdvisory";
import LiveAnalyticsRiskHeatmap from "./pages/LiveAnalyticsRiskHeatmap";
import SavedCorridorsCommuteArchive from "./pages/SavedCorridorsCommuteArchive";
import SystemArchitectureMethodology from "./pages/SystemArchitectureMethodology";
import CapstoneTeamShowcase from "./pages/CapstoneTeamShowcase";

function App() {
  return (
    <Router>
      <Header />
      <main className="min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/route-planner" element={<RoutePlanner />} />
          <Route path="/route" element={<RouteResults />} />
          <Route path="/about" element={<About />} />
          <Route path="/segment/:segmentId" element={<SegmentDiagnostics />} />
          <Route path="/hazard-advisory" element={<RealTimeHazardRerouteAdvisory />} />
          <Route path="/analytics" element={<LiveAnalyticsRiskHeatmap />} />
          <Route path="/saved-corridors" element={<SavedCorridorsCommuteArchive />} />
          <Route path="/methodology" element={<SystemArchitectureMethodology />} />
          <Route path="/capstone-showcase" element={<CapstoneTeamShowcase />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;
