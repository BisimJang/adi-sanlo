import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Topbar } from "../components/Topbar";
import { MetricCard } from "../components/MetricCard";
import { Badge } from "../components/Badge";
import { api } from "../lib/api";
import { fmt } from "../lib/utils";

const eventColor = {
  'invoice.paid':     'bg-[#1a9c5e]',
  'charge.failed':    'bg-[#b83232]',
  'invoice.pending':  'bg-accent',
  default:            'bg-indigo-mid',
};

export function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [activity, setActivity] = useState(null);
  const [plans, setPlans] = useState(null);

  useEffect(() => {
    Promise.all([
      api('/v1/metrics/mrr'),
      api('/v1/metrics/active'),
      api('/v1/metrics/failed'),
      api('/v1/metrics/churn'),
    ]).then(([mrr, active, failed, churn]) => {
      setMetrics([
        { label: 'MRR', value: fmt.naira(mrr.mrr), delta: null },
        { label: 'Active Subscribers', value: active.active_subscribers, delta: null },
        { label: 'Failed Payments', value: failed.failed_payments, delta: 'warn', note: failed.failed_payments > 0 ? 'needs attention' : 'all clear' },
        { label: 'Churn Rate', value: churn.churn_rate + '%', delta: null },
      ]);
    }).catch(() => setMetrics([]));

    api('/v1/metrics/recent-activity')
      .then(setActivity)
      .catch(() => setActivity([]));

    api('/v1/plans/top')
      .then(setPlans)
      .catch(() => setPlans([]));
  }, []);

  return (
    <>
      <Topbar title="Overview" />
      <div className="p-9 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
          {metrics === null ? (
            Array(4).fill(0).map((_, i) => <MetricCard key={i} loading />)
          ) : (
            metrics.map((m, i) => <MetricCard key={i} {...m} />)
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-white border border-border rounded-[4px] overflow-hidden">
            <div className="flex items-center justify-between p-[18px] px-6 border-b border-border">
              <h3 className="text-[14px] font-semibold text-ink">Recent Activity</h3>
              <Link to="/invoices" className="font-mono text-[11.5px] text-indigo-mid underline underline-offset-3">View all</Link>
            </div>
            <ul className="list-none m-0 p-0">
              {!activity ? (
                <li className="text-center p-12 font-mono text-[13px] text-indigo-mid">Loading activity...</li>
              ) : activity.length === 0 ? (
                <li className="text-center p-8 text-indigo-mid text-[13.5px]">No recent activity.</li>
              ) : (
                activity.slice(0, 8).map((item, i) => (
                  <li key={i} className="flex items-start gap-[14px] px-6 py-4 border-b border-border last:border-b-0">
                    <div className={`w-2 h-2 rounded-full mt-[5px] shrink-0 ${eventColor[item.event] || eventColor.default}`}></div>
                    <div>
                      <div className="text-[13.5px] text-ink font-medium">{item.event}</div>
                      <div className="font-mono text-[11.5px] text-indigo-mid mt-[3px]">
                        {item.amount ? fmt.naira(item.amount / 100) + ' · ' : ''}{fmt.time(item.timestamp)}
                      </div>
                    </div>
                    <div className="ml-auto"><Badge status={item.status} /></div>
                  </li>
                ))
              )}
            </ul>
          </div>

          <div className="bg-white border border-border rounded-[4px] overflow-hidden">
            <div className="flex items-center justify-between p-[18px] px-6 border-b border-border">
              <h3 className="text-[14px] font-semibold text-ink">Top Plans</h3>
              <Link to="/subscribers" className="font-mono text-[11.5px] text-indigo-mid underline underline-offset-3">View all</Link>
            </div>
            {!plans ? (
              <div className="text-center p-12 font-mono text-[13px] text-indigo-mid">Loading plans...</div>
            ) : plans.length === 0 ? (
              <div className="text-center p-8 text-indigo-mid text-[13.5px]">No plans created yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[13.5px]">
                  <thead>
                    <tr>
                      <th className="font-mono text-[11px] uppercase tracking-[0.08em] text-indigo-mid px-6 py-3 border-b border-border font-medium whitespace-nowrap">Plan</th>
                      <th className="font-mono text-[11px] uppercase tracking-[0.08em] text-indigo-mid px-6 py-3 border-b border-border font-medium whitespace-nowrap">Subs</th>
                      <th className="font-mono text-[11px] uppercase tracking-[0.08em] text-indigo-mid px-6 py-3 border-b border-border font-medium whitespace-nowrap">MRR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plans.map((p, i) => (
                      <tr key={i} className="border-b border-border last:border-b-0 hover:bg-[rgba(16,25,46,0.02)]">
                        <td className="px-6 py-3.5 text-ink align-middle">{p.name}</td>
                        <td className="px-6 py-3.5 font-mono text-[12.5px] text-indigo-mid align-middle">{p.subscriber_count}</td>
                        <td className="px-6 py-3.5 font-mono text-[13px] font-medium text-ink align-middle">{fmt.naira(p.mrr / 100)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
