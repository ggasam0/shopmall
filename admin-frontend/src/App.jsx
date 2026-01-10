import { Navigate, Route, Routes } from "react-router-dom";
import AdminDashboard from "./pages/AdminDashboard";
import DistributorDashboard from "./pages/DistributorDashboard";
import Login from "./pages/Login";
import TopNav from "./components/TopNav";

const getAuth = () => {
  const stored = localStorage.getItem("adminAuth");
  return stored ? JSON.parse(stored) : null;
};

const RequireAuth = ({ children, allow }) => {
  const auth = getAuth();
  if (!auth) {
    return <Navigate to="/login" replace />;
  }
  if (allow && auth.role !== allow) {
    return <Navigate to={auth.role === "admin" ? "/admin" : "/distributor"} replace />;
  }
  return children;
};

const App = () => {
  return (
    <div className="app">
      <TopNav />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/admin"
          element={
            <RequireAuth allow="admin">
              <AdminDashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/distributor"
          element={
            <RequireAuth allow="distributor">
              <DistributorDashboard />
            </RequireAuth>
          }
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
};

export default App;
