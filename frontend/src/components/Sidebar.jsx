import { NavLink, Link, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, FileText, Activity, CreditCard, Settings as SettingsIcon, LogOut, BookOpen } from "lucide-react";
import { cn } from "../lib/utils";

export function Sidebar() {
  const navigate = useNavigate();
  
  const links = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Overview" },
    { to: "/plans", icon: CreditCard, label: "Plans" },
    { to: "/subscribers", icon: Users, label: "Subscribers" },
    { to: "/invoices", icon: FileText, label: "Invoices" },
    { to: "/webhook-logs", icon: Activity, label: "Webhook Logs" },
    { to: "/docs", icon: BookOpen, label: "API Docs" },
    { to: "/settings", icon: SettingsIcon, label: "Settings" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("adi_sanlo_api_key");
    localStorage.removeItem("adi_sanlo_tenant_id");
    navigate("/signup");
    window.location.reload();
  };

  return (
    <aside className="fixed top-0 left-0 z-30 flex flex-col w-sidebar min-h-screen p-0 bg-ink">
      <Link to="/" className="relative flex items-center gap-[9px] font-bold text-[16px] text-white pt-7 px-6 pb-6 border-b border-[rgba(255,255,255,0.07)] tracking-[-0.01em] hover:opacity-80 transition-opacity overflow-hidden">
        <div 
          className="absolute inset-0 opacity-[0.08] mix-blend-overlay pointer-events-none"
          style={{ 
            backgroundImage: 'url(/adire-pattern.png)',
            backgroundSize: '150px',
            backgroundPosition: 'top left'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-ink pointer-events-none" />
        <span className="relative z-10 w-[7px] h-[7px] bg-accent inline-block"></span>
        <span className="relative z-10">Adi&#8209;Sanlo</span>
      </Link>
      
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
        <button 
          onClick={handleLogout}
          className="flex items-center gap-[11px] w-full text-left text-[14px] text-[#8fa0c9] hover:text-white transition-colors mb-4"
        >
          <LogOut className="w-4 h-4 opacity-70" />
          Sign Out
        </button>
        <div className="font-mono text-[10px] tracking-[0.1em] uppercase text-[#7284a3] mb-2">API</div>
        <div className="font-mono text-[11px] text-[#a9bbe0] break-all leading-[1.5]">
          adi-sanlo-production.up.railway.app
        </div>
      </div>
    </aside>
  );
}
