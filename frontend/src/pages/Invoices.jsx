import { useState, useEffect } from "react";
import { Topbar } from "../components/Topbar";
import { Badge } from "../components/Badge";
import { api } from "../lib/api";
import { fmt } from "../lib/utils";

export function Invoices() {
  const [invoices, setInvoices] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api('/v1/invoices')
      .then(setInvoices)
      .catch(e => setError(e.message));
  }, []);

  return (
    <>
      <Topbar title="Invoices" />
      <div className="p-9 flex-1">
        <div className="mb-7">
          <h1 className="text-[22px] font-bold text-ink tracking-tight m-0">Invoices</h1>
          <div className="text-[13.5px] text-indigo-mid mt-1">Billing history and dunning</div>
        </div>

        <div className="bg-white border border-border rounded-[4px] overflow-hidden overflow-x-auto">
          {error ? (
            <div className="text-center p-16 text-indigo-mid text-[13.5px]"><h3>Could not load data</h3><p>{error}</p></div>
          ) : !invoices ? (
            <div className="text-center p-12 font-mono text-[13px] text-indigo-mid">Loading invoices...</div>
          ) : invoices.length === 0 ? (
            <div className="text-center p-16 text-indigo-mid text-[13.5px]">No invoices found.</div>
          ) : (
            <table className="w-full text-left border-collapse text-[13.5px]">
              <thead>
                <tr>
                  <th className="font-mono text-[11px] uppercase tracking-[0.08em] text-indigo-mid px-6 py-3 border-b border-border font-medium">ID</th>
                  <th className="font-mono text-[11px] uppercase tracking-[0.08em] text-indigo-mid px-6 py-3 border-b border-border font-medium">Status</th>
                  <th className="font-mono text-[11px] uppercase tracking-[0.08em] text-indigo-mid px-6 py-3 border-b border-border font-medium">Amount</th>
                  <th className="font-mono text-[11px] uppercase tracking-[0.08em] text-indigo-mid px-6 py-3 border-b border-border font-medium">Date</th>
                  <th className="font-mono text-[11px] uppercase tracking-[0.08em] text-indigo-mid px-6 py-3 border-b border-border font-medium">Attempts</th>
                  <th className="font-mono text-[11px] uppercase tracking-[0.08em] text-indigo-mid px-6 py-3 border-b border-border font-medium">Sub ID</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((i, idx) => (
                  <tr key={idx} className="border-b border-border last:border-b-0 hover:bg-[rgba(16,25,46,0.02)]">
                    <td className="px-6 py-3.5 font-mono text-[12.5px] text-indigo-mid align-middle">{i.id.slice(0, 8)}</td>
                    <td className="px-6 py-3.5 align-middle"><Badge status={i.status} /></td>
                    <td className="px-6 py-3.5 font-mono text-[13px] font-medium text-ink align-middle">{fmt.naira(i.amount / 100)}</td>
                    <td className="px-6 py-3.5 font-mono text-[12.5px] text-indigo-mid align-middle">{fmt.date(i.created_at)}</td>
                    <td className="px-6 py-3.5 font-mono text-[12.5px] text-indigo-mid align-middle">{i.attempt_count}</td>
                    <td className="px-6 py-3.5 font-mono text-[12.5px] text-indigo-mid align-middle">{i.subscription_id.slice(0, 8)}...</td>
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
