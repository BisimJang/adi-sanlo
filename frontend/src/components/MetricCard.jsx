import { cn } from "../lib/utils";

export function MetricCard({ label, value, delta, note, loading }) {
  return (
    <div className="bg-white border border-border rounded-[4px] p-6 flex flex-col gap-[10px]">
      <div className="metric-label">{label}</div>
      <div className={cn("metric-value", loading && "opacity-50 text-indigo-mid font-mono text-[16px]")}>
        {loading ? "Loading..." : value || "—"}
      </div>
      {note && (
        <div className={cn(
          "font-mono text-[12px]",
          delta === 'up' && "text-[#1a9c5e]",
          delta === 'down' && "text-[#b83232]",
          delta === 'warn' && "text-accent"
        )}>
          {note}
        </div>
      )}
    </div>
  );
}
