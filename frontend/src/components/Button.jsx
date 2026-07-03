import { cn } from "../lib/utils";

export function Button({ children, variant = "primary", size = "md", className, ...props }) {
  const base = "font-mono font-medium rounded-[3px] border border-transparent transition-colors inline-flex items-center gap-[6px]";
  
  const variants = {
    primary: "bg-accent text-ink border-accent hover:bg-[#c9962e] hover:border-[#c9962e]",
    ghost: "bg-transparent text-indigo-mid border-border hover:border-ink hover:text-ink",
    danger: "bg-transparent text-[#b83232] border-[rgba(184,50,50,0.3)] hover:bg-[rgba(184,50,50,0.07)]",
  };

  const sizes = {
    sm: "px-[10px] py-[5px] text-[11px]",
    md: "px-3.5 py-[7px] text-xs",
    lg: "px-6 py-3.5 text-[13.5px]",
  };

  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
}
