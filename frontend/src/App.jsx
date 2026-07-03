import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Landing } from "./pages/Landing";
import { Dashboard } from "./pages/Dashboard";
import { Plans } from "./pages/Plans";
import { Subscribers } from "./pages/Subscribers";
import { Invoices } from "./pages/Invoices";
import { WebhookLogs } from "./pages/WebhookLogs";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/plans" element={<Plans />} />
        <Route path="/subscribers" element={<Subscribers />} />
        <Route path="/invoices" element={<Invoices />} />
        <Route path="/webhook-logs" element={<WebhookLogs />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
