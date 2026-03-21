import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Bell, User } from "lucide-react";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/keys": "Hollow Key Manager",
  "/attacks": "Attack Intelligence",
  "/sandbox": "Sandbox Monitor",
  "/guardians": "Guardian Network",
};

export function TopBar() {
  const location = useLocation();
  const [time, setTime] = useState(new Date());
  const [isAttack] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const title = pageTitles[location.pathname] || "Dashboard";

  return (
    <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6">
      <h1 className="text-base font-bold text-foreground">{title}</h1>
      <div className="flex items-center gap-2">
        <div className={cn("flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium", isAttack ? "bg-sentinel-red-light text-sentinel-red" : "bg-sentinel-green-light text-sentinel-green")}>
          <span className={cn("w-2 h-2 rounded-full", isAttack ? "bg-sentinel-red animate-pulse-dot" : "bg-sentinel-green")} />
          {isAttack ? "Attack Detected" : "All Systems Nominal"}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="font-mono text-xs text-muted-foreground">
          {time.toLocaleTimeString("en-US", { hour12: false })}
        </span>
        <button className="relative text-muted-foreground hover:text-foreground transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-sentinel-red rounded-full" />
        </button>
        <div className="w-7 h-7 rounded-full bg-sentinel-indigo-light flex items-center justify-center">
          <User className="w-4 h-4 text-sentinel-indigo" />
        </div>
      </div>
    </header>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
