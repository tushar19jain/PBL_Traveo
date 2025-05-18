import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Header from "./components/Header";
import Footer from "./components/Footer";
import MapView from "./pages/MapView";
import MstVisualizer from "./pages/MSTVisualizer";
import PathFinder from "./pages/PathFinder";
import RecommendationPage from "./pages/Recommendations";
import Playground from "./pages/Playground";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/map" element={<MapView />} />
        <Route path="/mst" element={<MstVisualizer />} />
        <Route path="/pathfinder" element ={<PathFinder />} />
        <Route path="/recommend" element={<RecommendationPage />} />
        <Route path="/playground" element={<Playground />} />
      </Routes>
    </Router>
  );
}

export default App;
