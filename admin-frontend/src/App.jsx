import { Navigate, Route, Routes } from "react-router-dom";
import AdminDashboard from "./pages/AdminDashboard";
import DistributorDashboard from "./pages/DistributorDashboard";
import TopNav from "./components/TopNav";

const App = () => {
  return (
    <div className="app">
      <TopNav />
      <Routes>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/distributor" element={<DistributorDashboard />} />
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </div>
  );
};

export default App;
