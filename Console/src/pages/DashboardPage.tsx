import { useState, useEffect } from "react";
import { Shield, Key, Terminal, Bot, ArrowUp } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { SeverityBadge } from "@/components/SeverityBadge";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const mockFeed = [
  { id: 1, severity: "critical" as const, desc: "DNS exfiltration attempt blocked", agent: "agent-2c91", time: "12:04:32" },
  { id: 2, severity: "high" as const, desc: "Prompt injection detected and quarantined", agent: "agent-8d4e", time: "12:03:18" },
  { id: 3, severity: "medium" as const, desc: "Unusual network pattern flagged", agent: "agent-f7a1", time: "12:01:45" },
  { id: 4, severity: "low" as const, desc: "Rate limit threshold approaching", agent: "agent-3b9c", time: "11:59:22" },
  { id: 5, severity: "info" as const, desc: "Routine key rotation completed", agent: "agent-7f3a", time: "11:58:01" },
  { id: 6, severity: "critical" as const, desc: "Shard theft attempt from external IP", agent: "agent-unknown", time: "11:55:44" },
  { id: 7, severity: "medium" as const, desc: "Sandbox anomaly detected — contained", agent: "agent-a29f", time: "11:54:12" },
  { id: 8, severity: "low" as const, desc: "Intent mismatch — auto-corrected", agent: "agent-c7f1", time: "11:52:30" },
];

const chartData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  attacks: Math.floor(Math.random() * 40 + 5),
}));

const healthServices = [
  { name: "API Gateway", status: "online", latency: "12ms", heartbeat: "2s ago" },
  { name: "Control Plane", status: "online", latency: "8ms", heartbeat: "1s ago" },
  { name: "Key Vault", status: "online", latency: "3ms", heartbeat: "1s ago" },
  { name: "Intent Firewall", status: "online", latency: "15ms", heartbeat: "3s ago" },
  { name: "Ghost Reviewer", status: "offline", latency: "—", heartbeat: "5m ago" },
];

export default function DashboardPage() {
  const [feed, setFeed] = useState(mockFeed);
  const [flashIdx, setFlashIdx] = useState(-1);

  useEffect(() => {
    const interval = setInterval(() => {
      const severities = ["critical", "high", "medium", "low", "info"] as const;
      const newEvent = {
        id: Date.now(),
        severity: severities[Math.floor(Math.random() * severities.length)],
        desc: "New security event detected",
        agent: `agent-${Math.random().toString(16).slice(2, 6)}`,
        time: new Date().toLocaleTimeString("en-US", { hour12: false }),
      };
      setFeed((prev) => [newEvent, ...prev.slice(0, 7)]);
      setFlashIdx(0);
      setTimeout(() => setFlashIdx(-1), 800);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Agents Protected" value={24} icon={Bot} change={12} />
        <StatCard title="Attacks Blocked (24h)" value={147} icon={Shield} change={-8} valueColor="text-sentinel-red" iconColor="text-sentinel-red" iconBg="bg-sentinel-red-light" />
        <StatCard title="Keys Issued" value={89} icon={Key} change={5} />
        <StatCard title="Sandboxes Executed" value={1243} icon={Terminal} change={23} />
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Live Feed */}
        <div className="lg:col-span-3 bg-card rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="font-bold text-foreground">Live Attack Feed</h2>
            <span className="w-2 h-2 rounded-full bg-sentinel-green animate-pulse-dot" />
          </div>
          <div className="space-y-1 max-h-[360px] overflow-y-auto">
            {feed.map((event, i) => (
              <div
                key={event.id}
                className={`flex items-center gap-3 py-2.5 px-3 rounded-lg transition-colors duration-800 ${i === flashIdx ? "animate-flash-yellow" : ""}`}
              >
                <SeverityBadge severity={event.severity} />
                <span className="text-sm text-foreground flex-1 truncate">{event.desc}</span>
                <span className="text-xs font-mono text-muted-foreground">{event.agent}</span>
                <span className="text-xs font-mono text-muted-foreground">{event.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div className="lg:col-span-2 bg-card rounded-2xl shadow-sm p-5">
          <h2 className="font-bold text-foreground mb-4">Attack Frequency</h2>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" />
              <XAxis dataKey="hour" tick={{ fontSize: 11 }} stroke="hsl(215 16% 47%)" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(215 16% 47%)" />
              <Tooltip />
              <Line type="monotone" dataKey="attacks" stroke="hsl(243 75% 59%)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* System Health */}
      <div className="bg-card rounded-2xl shadow-sm p-5">
        <h2 className="font-bold text-foreground mb-4">System Health</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {healthServices.map((svc) => (
            <div key={svc.name} className={`rounded-xl p-4 border ${svc.status === "offline" ? "bg-sentinel-red-light border-sentinel-red/20" : "border-border"}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-2 h-2 rounded-full ${svc.status === "online" ? "bg-sentinel-green" : "bg-sentinel-red"}`} />
                <span className="text-sm font-medium text-foreground">{svc.name}</span>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>Latency: <span className="font-mono">{svc.latency}</span></div>
                <div>Heartbeat: <span className="font-mono">{svc.heartbeat}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
