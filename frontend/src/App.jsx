import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Landing } from "./pages/Landing";
import { Dashboard } from "./pages/Dashboard";
import { Plans } from "./pages/Plans";
import { Subscribers } from "./pages/Subscribers";
import { Invoices } from "./pages/Invoices";
import { WebhookLogs } from "./pages/WebhookLogs";
import { Signup } from "./pages/Signup";
import { Login } from "./pages/Login";
import { Demo } from "./pages/Demo";
import { Settings } from "./pages/Settings";
import { Docs } from "./pages/Docs";

function ProtectedRoute({ children }) {
  const apiKey = localStorage.getItem("adi_sanlo_api_key");
  const location = useLocation();

  if (!apiKey) {
    return <Navigate to="/signup" state={{ from: location }} replace />;
  }

  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/demo" element={<Demo />} />
      <Route element={<Layout />}>
        <Route path="/docs" element={<Docs />} />
      </Route>
      <Route element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/plans" element={<Plans />} />
        <Route path="/subscribers" element={<Subscribers />} />
        <Route path="/invoices" element={<Invoices />} />
        <Route path="/webhook-logs" element={<WebhookLogs />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
