import { useState, useEffect, useCallback } from "react";
import { Topbar } from "../components/Topbar";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { api } from "../lib/api";
import { fmt, cn } from "../lib/utils";

function CreatePlanModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: "", amount: "", interval: "monthly", description: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!form.name || !form.amount) { setError("Name and amount are required."); return; }
    const amountKobo = Math.round(parseFloat(form.amount) * 100);
    if (isNaN(amountKobo) || amountKobo <= 0) { setError("Enter a valid amount in Naira."); return; }

    setLoading(true);
    try {
      const plan = await api("/v1/plans", {
        method: "POST",
        body: JSON.stringify({
          name: form.name,
          amount: amountKobo,
          interval: form.interval,
          currency: "NGN",
          description: form.description || null,
        }),
      });
      onCreated(plan);
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white border border-border rounded-[6px] w-full max-w-[440px] mx-4 shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-[15px] font-semibold text-ink">Create a new plan</h2>
          <button onClick={onClose} className="text-indigo-mid hover:text-ink text-xl leading-none bg-transparent border-none p-0">&#x2715;</button>
        </div>

        <form onSubmit={submit} className="p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[11px] uppercase tracking-[0.08em] text-indigo-mid">Plan name</label>
            <input
              type="text"
              placeholder="e.g. Pro Monthly"
              value={form.name}
              onChange={e => set("name", e.target.value)}
              className="border border-border rounded-[3px] px-3 py-2.5 text-[14px] text-ink bg-surface outline-none focus:border-ink transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[11px] uppercase tracking-[0.08em] text-indigo-mid">Amount (&#8358;)</label>
              <input
                type="number"
                placeholder="5000"
                min="1"
                step="any"
                value={form.amount}
                onChange={e => set("amount", e.target.value)}
                className="border border-border rounded-[3px] px-3 py-2.5 text-[14px] text-ink bg-surface outline-none focus:border-ink transition-colors"
              />
              <span className="font-mono text-[10.5px] text-indigo-mid">In Naira, not kobo</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[11px] uppercase tracking-[0.08em] text-indigo-mid">Billing cycle</label>
              <select
                value={form.interval}
                onChange={e => set("interval", e.target.value)}
                className="border border-border rounded-[3px] px-3 py-2.5 text-[14px] text-ink bg-surface outline-none focus:border-ink transition-colors"
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[11px] uppercase tracking-[0.08em] text-indigo-mid">Description <span className="normal-case tracking-normal text-[10px]">(optional)</span></label>
            <input
              type="text"
              placeholder="e.g. Full access to all courses"
              value={form.description}
              onChange={e => set("description", e.target.value)}
              className="border border-border rounded-[3px] px-3 py-2.5 text-[14px] text-ink bg-surface outline-none focus:border-ink transition-colors"
            />
          </div>

          {error && (
            <div className="font-mono text-[12px] text-[#b83232] bg-[rgba(184,50,50,0.06)] border border-[rgba(184,50,50,0.2)] px-3 py-2.5 rounded-[3px]">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create plan"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function Plans() {
  const [plans, setPlans] = useState(null);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const load = useCallback(() => {
    setPlans(null);
    setError(null);
    api("/v1/plans")
      .then(setPlans)
      .catch(e => setError(e.message));
  }, []);

  useEffect(() => { load(); }, [load]);

  const deactivate = async (id) => {
    if (!window.confirm("Deactivate this plan? Existing subscribers will not be affected.")) return;
    try {
      await api(`/v1/plans/${id}`, { method: "DELETE" });
      load();
    } catch (e) {
      alert("Failed: " + e.message);
    }
  };

  return (
    <>
      {showModal && (
        <CreatePlanModal
          onClose={() => setShowModal(false)}
          onCreated={() => load()}
        />
      )}

      <Topbar title="Plans" />
      <div className="p-9 flex-1">
        <div className="flex items-center justify-between mb-7">
          <div>
            <h1 className="text-[22px] font-bold text-ink tracking-tight m-0">Plans</h1>
            <div className="text-[13.5px] text-indigo-mid mt-1">Define your billing plans for customers to subscribe to</div>
          </div>
          <Button variant="primary" onClick={() => setShowModal(true)}>+ Create plan</Button>
        </div>

        {error ? (
          <div className="text-center p-16 text-indigo-mid">{error}</div>
        ) : !plans ? (
          <div className="text-center p-12 font-mono text-[13px] text-indigo-mid">Loading plans...</div>
        ) : plans.length === 0 ? (
          <div className="bg-white border border-border rounded-[4px] p-16 text-center">
            <div className="text-[15px] font-semibold text-ink mb-2">No plans yet</div>
            <div className="text-[13.5px] text-indigo-mid mb-6">Create your first billing plan to start accepting subscriptions.</div>
            <Button variant="primary" onClick={() => setShowModal(true)}>+ Create your first plan</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.map(plan => (
              <div key={plan.id} className="bg-white border border-border rounded-[4px] p-6 flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[16px] font-semibold text-ink">{plan.name}</div>
                    {plan.description && <div className="text-[13px] text-indigo-mid mt-1">{plan.description}</div>}
                  </div>
                  <Badge status={plan.is_active ? "active" : "cancelled"} />
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-[28px] font-bold text-ink tracking-tight">{fmt.naira(plan.amount / 100)}</span>
                  <span className="font-mono text-[12px] text-indigo-mid">/{plan.interval}</span>
                </div>

                <div className="flex flex-col gap-1 pt-2 border-t border-border">
                  <div className="flex justify-between text-[12px]">
                    <span className="font-mono text-indigo-mid uppercase tracking-[0.06em]">Currency</span>
                    <span className="font-mono text-ink">{plan.currency}</span>
                  </div>
                  <div className="flex justify-between text-[12px]">
                    <span className="font-mono text-indigo-mid uppercase tracking-[0.06em]">Plan ID</span>
                    <span className="font-mono text-[11px] text-indigo-mid truncate max-w-[160px]">{plan.id}</span>
                  </div>
                  <div className="flex justify-between text-[12px]">
                    <span className="font-mono text-indigo-mid uppercase tracking-[0.06em]">Created</span>
                    <span className="font-mono text-ink">{fmt.date(plan.created_at)}</span>
                  </div>
                </div>

                <Button variant="danger" size="sm" onClick={() => deactivate(plan.id)}>
                  Deactivate
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
