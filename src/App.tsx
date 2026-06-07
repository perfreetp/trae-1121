import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/Layout/Layout";
import Dashboard from "@/pages/Dashboard";
import StationMap from "@/pages/StationMap";
import PassengerWarning from "@/pages/PassengerWarning";
import EventHandling from "@/pages/EventHandling";
import Patrol from "@/pages/Patrol";
import Contact from "@/pages/Contact";
import Materials from "@/pages/Materials";
import Review from "@/pages/Review";
import Handover from "@/pages/Handover";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/station-map" element={<StationMap />} />
          <Route path="/passenger-warning" element={<PassengerWarning />} />
          <Route path="/event-handling" element={<EventHandling />} />
          <Route path="/patrol" element={<Patrol />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/materials" element={<Materials />} />
          <Route path="/review" element={<Review />} />
          <Route path="/handover" element={<Handover />} />
        </Route>
      </Routes>
    </Router>
  );
}
