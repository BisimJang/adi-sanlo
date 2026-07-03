import { cn } from "../lib/utils";

export function Badge({ status, className }) {
  const map = {
    active:     "bg-[rgba(26,156,94,0.08)] text-[#1a9c5e] before:bg-[#1a9c5e]",
    past_due:   "bg-[rgba(227,169,58,0.1)] text-[#b8841a] before:bg-accent",
    dunning:    "bg-[rgba(200,100,30,0.1)] text-[#c8641e] before:bg-[#c8641e]",
    paused:     "bg-[rgba(47,74,122,0.08)] text-indigo-mid before:bg-indigo-mid",
    cancelled:  "bg-[rgba(184,50,50,0.07)] text-[#b83232] before:bg-[#b83232]",
    paid:       "bg-[rgba(26,156,94,0.08)] text-[#1a9c5e] before:bg-[#1a9c5e]",
    failed:     "bg-[rgba(184,50,50,0.07)] text-[#b83232] before:bg-[#b83232]",
    open:       "bg-[rgba(227,169,58,0.1)] text-[#b8841a] before:bg-accent",
    incomplete: "bg-[rgba(47,74,122,0.08)] text-indigo-mid before:bg-indigo-mid",
  };

  const cls = map[status] || map.paused;
  const label = status ? status.replace('_', ' ') : 'paused';

  return (
    <span className={cn(
      "inline-flex items-center gap-[6px] font-mono text-[11px] font-medium tracking-[0.05em] px-[10px] py-1 rounded-[3px] uppercase",
      "before:content-[''] before:w-[5px] before:h-[5px] before:rounded-full before:inline-block",
      cls,
      className
    )}>
      {label}
    </span>
  );
}
