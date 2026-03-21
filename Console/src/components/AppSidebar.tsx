import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Key, Shield, Terminal, Network, Settings, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/keys", icon: Key, label: "Hollow Keys" },
  { to: "/attacks", icon: Shield, label: "Attack Intelligence" },
  { to: "/sandbox", icon: Terminal, label: "Sandbox Monitor" },
  { to: "/guardians", icon: Network, label: "Guardian Network" },
];

export function AppSidebar() {
  const [expanded, setExpanded] = useState(false);
  const location = useLocation();

  return (
    <aside
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      className={cn(
        "fixed left-0 top-0 h-screen bg-sidebar border-r border-border flex flex-col justify-between z-50 transition-all duration-200",
        expanded ? "w-[220px]" : "w-16"
      )}
    >
      <div className="flex flex-col gap-1 pt-4 px-2">
        <div className="flex items-center gap-2 px-2 mb-6">
          <Shield className="w-6 h-6 text-sentinel-indigo shrink-0" />
          {expanded && <span className="font-bold text-foreground text-sm whitespace-nowrap">Sentinel AI</span>}
        </div>
        {navItems.map((item) => {
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted"
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {expanded && <span className="whitespace-nowrap">{item.label}</span>}
            </Link>
          );
        })}
      </div>
      <div className="flex flex-col gap-1 px-2 pb-4">
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted transition-colors">
          <Settings className="w-5 h-5 shrink-0" />
          {expanded && <span>Settings</span>}
        </button>
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-7 h-7 rounded-full bg-sentinel-indigo-light flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-sentinel-indigo" />
          </div>
          {expanded && <span className="text-sm text-foreground">Operator</span>}
        </div>
      </div>
    </aside>
  );
}
