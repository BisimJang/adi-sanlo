import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, FileText, Activity, CreditCard } from "lucide-react";
import { cn } from "../lib/utils";

export function Sidebar() {
  const links = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Overview" },
    { to: "/plans", icon: CreditCard, label: "Plans" },
    { to: "/subscribers", icon: Users, label: "Subscribers" },
    { to: "/invoices", icon: FileText, label: "Invoices" },
    { to: "/webhook-logs", icon: Activity, label: "Webhook Logs" },
  ];

  return (
    <aside className="fixed top-0 left-0 z-30 flex flex-col w-sidebar min-h-screen p-0 bg-ink">
      <div className="flex items-center gap-[9px] font-bold text-[16px] text-white pt-7 px-6 pb-6 border-b border-[rgba(255,255,255,0.07)] tracking-[-0.01em]">
        <span className="w-[7px] h-[7px] bg-accent inline-block"></span>
        Adi&#8209;Sanlo
      </div>
      
      <nav className="flex flex-col flex-1 gap-[2px] py-5">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => cn(
              "flex items-center gap-[11px] px-6 py-2.5 text-[14px] border-l-2 transition-colors",
              isActive 
                ? "text-white border-accent bg-[rgba(255,255,255,0.06)]" 
                : "text-[#8fa0c9] border-transparent hover:text-white hover:bg-[rgba(255,255,255,0.04)]"
            )}
          >
            <link.icon className="w-4 h-4 opacity-70" />
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-6 border-t border-[rgba(255,255,255,0.07)]">
        <div className="font-mono text-[10px] tracking-[0.1em] uppercase text-[#7284a3] mb-2">API</div>
        <div className="font-mono text-[11px] text-[#a9bbe0] break-all leading-[1.5]">
          adi-sanlo-production.up.railway.app
        </div>
      </div>
    </aside>
  );
}
