import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import RoutePlanner from "./pages/RoutePlanner";
import RouteResults from "./pages/RouteResults";
import Header from "./components/Header";
import Footer from "./components/Footer";
import About from "./pages/About";
import { Analytics, HazardAdvisory, SegmentDiagnostics } from "./pages/Phase2";

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
          <Route path="/hazard-advisory" element={<HazardAdvisory />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;
