import { useState, useEffect } from "react";
import { Topbar } from "../components/Topbar";
import { Badge } from "../components/Badge";
import { api } from "../lib/api";
import { fmt } from "../lib/utils";

export function WebhookLogs() {
  const [logs, setLogs] = useState(null);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    // using recent activity as proxy for webhook logs
    api('/v1/metrics/recent-activity')
      .then(setLogs)
      .catch(e => setError(e.message));
  }, []);

  const togglePayload = (i) => {
    setExpanded(prev => ({ ...prev, [i]: !prev[i] }));
  };

  return (
    <>
      <Topbar title="Webhook Logs" />
      <div className="p-9 flex-1">
        <div className="mb-7">
          <h1 className="text-[22px] font-bold text-ink tracking-tight m-0">Webhook Logs</h1>
          <div className="text-[13.5px] text-indigo-mid mt-1">Recent events received from Nomba</div>
        </div>

        <div className="bg-white border border-border rounded-[4px] overflow-hidden overflow-x-auto">
          {error ? (
            <div className="text-center p-16 text-indigo-mid text-[13.5px]"><h3>Could not load data</h3><p>{error}</p></div>
          ) : !logs ? (
            <div className="text-center p-12 font-mono text-[13px] text-indigo-mid">Loading logs...</div>
          ) : logs.length === 0 ? (
            <div className="text-center p-16 text-indigo-mid text-[13.5px]">No webhook events recorded yet.</div>
          ) : (
            <table className="w-full text-left border-collapse text-[13.5px]">
              <thead>
                <tr>
                  <th className="font-mono text-[11px] uppercase tracking-[0.08em] text-indigo-mid px-6 py-3 border-b border-border font-medium">Event</th>
                  <th className="font-mono text-[11px] uppercase tracking-[0.08em] text-indigo-mid px-6 py-3 border-b border-border font-medium">Status</th>
                  <th className="font-mono text-[11px] uppercase tracking-[0.08em] text-indigo-mid px-6 py-3 border-b border-border font-medium">Amount</th>
                  <th className="font-mono text-[11px] uppercase tracking-[0.08em] text-indigo-mid px-6 py-3 border-b border-border font-medium">Time</th>
                  <th className="font-mono text-[11px] uppercase tracking-[0.08em] text-indigo-mid px-6 py-3 border-b border-border font-medium">Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((i, idx) => (
                  <tr key={idx} className="border-b border-border last:border-b-0 hover:bg-[rgba(16,25,46,0.02)]">
                    <td className="px-6 py-3.5 font-medium text-ink align-middle">{i.event}</td>
                    <td className="px-6 py-3.5 align-middle"><Badge status={i.status} /></td>
                    <td className="px-6 py-3.5 font-mono text-[13px] font-medium text-ink align-middle">{i.amount ? fmt.naira(i.amount / 100) : '—'}</td>
                    <td className="px-6 py-3.5 font-mono text-[12.5px] text-indigo-mid align-middle">{fmt.time(i.timestamp)}</td>
                    <td className="px-6 py-3.5 align-middle">
                      <button 
                        onClick={() => togglePayload(idx)}
                        className="font-mono text-[11px] text-indigo-mid underline underline-offset-2 hover:text-ink transition-colors bg-transparent border-none p-0"
                      >
                        {expanded[idx] ? 'Hide Payload' : 'Show Payload'}
                      </button>
                      {expanded[idx] && (
                        <pre className="mt-2 bg-[#0c1220] text-[#a9bbe0] p-3 rounded-[4px] font-mono text-[11px] whitespace-pre-wrap break-all">
{`{
  "event": "${i.event}",
  "timestamp": "${i.timestamp}",
  "status": "${i.status}"${i.amount ? `,\n  "amount": ${i.amount}` : ''}
}`}
                        </pre>
                      )}
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
