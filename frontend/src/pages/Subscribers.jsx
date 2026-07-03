import { useState, useEffect, useCallback } from "react";
import { Topbar } from "../components/Topbar";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { api } from "../lib/api";
import { cn, fmt } from "../lib/utils";

export function Subscribers() {
  const [subs, setSubs] = useState(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState(null);

  const loadData = useCallback(() => {
    setSubs(null);
    setError(null);
    const url = status ? `/v1/subscriptions?status=${status}` : '/v1/subscriptions';
    api(url)
      .then(setSubs)
      .catch(e => setError(e.message));
  }, [status]);

  useEffect(() => { loadData(); }, [loadData]);

  const act = async (action, id) => {
    if (!window.confirm(`Are you sure you want to ${action} this subscription?`)) return;
    try {
      await api(`/v1/subscriptions/${id}/${action}`, { method: 'POST' });
      loadData();
    } catch (e) {
      alert(`Failed to ${action} subscription: ` + e.message);
    }
  };

  const tabs = [
    { value: "", label: "All" },
    { value: "active", label: "Active" },
    { value: "incomplete", label: "Incomplete" },
    { value: "paused", label: "Paused" },
    { value: "cancelled", label: "Cancelled" },
  ];

  return (
    <>
      <Topbar title="Subscribers" />
      <div className="p-9 flex-1">
        <div className="flex flex-wrap items-center justify-between mb-7 gap-4">
          <div>
            <h1 className="text-[22px] font-bold text-ink tracking-tight m-0">Subscribers</h1>
            <div className="text-[13.5px] text-indigo-mid mt-1">Manage recurring billing customers</div>
          </div>
          <div className="flex bg-white border border-border rounded-[4px] overflow-hidden">
            {tabs.map(tab => (
              <button
                key={tab.value}
                onClick={() => setStatus(tab.value)}
                className={cn(
                  "font-mono text-[12px] px-4 py-2 border-r border-border last:border-r-0 transition-colors",
                  status === tab.value ? "bg-ink text-white" : "bg-transparent text-indigo-mid hover:bg-surface"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white border border-border rounded-[4px] overflow-hidden overflow-x-auto">
          {error ? (
            <div className="text-center p-16 text-indigo-mid text-[13.5px]"><h3>Could not load data</h3><p>{error}</p></div>
          ) : !subs ? (
            <div className="text-center p-12 font-mono text-[13px] text-indigo-mid">Loading subscribers...</div>
          ) : subs.length === 0 ? (
            <div className="text-center p-16 text-indigo-mid text-[13.5px]">No subscribers found.</div>
          ) : (
            <table className="w-full text-left border-collapse text-[13.5px]">
              <thead>
                <tr>
                  <th className="font-mono text-[11px] uppercase tracking-[0.08em] text-indigo-mid px-6 py-3 border-b border-border font-medium">Customer ID</th>
                  <th className="font-mono text-[11px] uppercase tracking-[0.08em] text-indigo-mid px-6 py-3 border-b border-border font-medium">Plan</th>
                  <th className="font-mono text-[11px] uppercase tracking-[0.08em] text-indigo-mid px-6 py-3 border-b border-border font-medium">Status</th>
                  <th className="font-mono text-[11px] uppercase tracking-[0.08em] text-indigo-mid px-6 py-3 border-b border-border font-medium">Period End</th>
                  <th className="font-mono text-[11px] uppercase tracking-[0.08em] text-indigo-mid px-6 py-3 border-b border-border font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subs.map((s, i) => (
                  <tr key={i} className="border-b border-border last:border-b-0 hover:bg-[rgba(16,25,46,0.02)]">
                    <td className="px-6 py-3.5 font-mono text-[12.5px] text-indigo-mid align-middle">{s.customer_id.slice(0, 8)}...</td>
                    <td className="px-6 py-3.5 text-ink align-middle">{s.plan_id}</td>
                    <td className="px-6 py-3.5 align-middle"><Badge status={s.status} /></td>
                    <td className="px-6 py-3.5 font-mono text-[12.5px] text-indigo-mid align-middle">{fmt.date(s.current_period_end)}</td>
                    <td className="px-6 py-3.5 align-middle flex gap-2">
                      {s.status === 'active' && <Button variant="ghost" size="sm" onClick={() => act('pause', s.id)}>Pause</Button>}
                      {s.status !== 'cancelled' && <Button variant="danger" size="sm" onClick={() => act('cancel', s.id)}>Cancel</Button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
