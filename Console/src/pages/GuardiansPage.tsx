import { useState, useEffect, useRef } from "react";
import { Cloud, Server, Smartphone, Settings, AlertTriangle } from "lucide-react";
import { CopyButton } from "@/components/CopyButton";

interface GuardianNode {
  id: string;
  name: string;
  subtext: string;
  icon: typeof Cloud;
  fill: string;
  border: string;
  x: number;
  y: number;
  online: boolean;
}

const initialNodes: GuardianNode[] = [
  { id: "aws", name: "Cloud Vault", subtext: "AWS us-east-1", icon: Cloud, fill: "#EEF2FF", border: "#4F46E5", x: 150, y: 80, online: true },
  { id: "gcp", name: "Cloud Vault", subtext: "GCP asia-south1", icon: Cloud, fill: "#EEF2FF", border: "#4F46E5", x: 550, y: 80, online: true },
  { id: "mpc", name: "MPC Coordinator", subtext: "Orchestrator", icon: Settings, fill: "#F0FDF4", border: "#16A34A", x: 350, y: 200, online: true },
  { id: "edge", name: "Edge Node", subtext: "On-premise vault", icon: Server, fill: "#FFFBEB", border: "#D97706", x: 150, y: 320, online: true },
  { id: "nethunter", name: "NetHunter", subtext: "Physical Guardian", icon: Smartphone, fill: "#F0FDF4", border: "#16A34A", x: 550, y: 320, online: true },
];

const connections = [
  { from: "aws", to: "mpc", label: "Shard A" },
  { from: "gcp", to: "mpc", label: "Shard B" },
  { from: "edge", to: "mpc", label: "Shard C" },
  { from: "nethunter", to: "mpc", label: "Shard D" },
  { from: "aws", to: "edge", label: "Shard E" },
];

const guardianCards = [
  { name: "Cloud Vault AWS", shard: "shard-••••-7f3a", ping: "12ms ago", latency: "3ms" },
  { name: "Cloud Vault GCP", shard: "shard-••••-2c91", ping: "8ms ago", latency: "45ms" },
  { name: "MPC Coordinator", shard: "shard-••••-a29f", ping: "1ms ago", latency: "1ms" },
  { name: "Edge Node", shard: "shard-••••-8d4e", ping: "24ms ago", latency: "18ms" },
  { name: "NetHunter Device", shard: "shard-••••-f7a1", ping: "5s ago", latency: "120ms" },
];

export default function GuardiansPage() {
  const [nodes, setNodes] = useState(initialNodes);
  const [killSwitchActive, setKillSwitchActive] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testInput, setTestInput] = useState("");

  const handleKillSwitch = () => {
    setKillSwitchActive(true);
    setNodes((prev) => prev.map((n) => n.id === "nethunter" ? { ...n, online: false, border: "#DC2626", fill: "#F3F4F6" } : n));
  };

  const handleReset = () => {
    setKillSwitchActive(false);
    setNodes(initialNodes);
    setTestResult(null);
  };

  const handleTest = () => {
    if (killSwitchActive) {
      setTestResult("fail");
    } else {
      setTestResult("pass");
    }
  };

  const getNodeById = (id: string) => nodes.find((n) => n.id === id)!;

  return (
    <div className="space-y-6">
      {/* Warning Banner */}
      {killSwitchActive && (
        <div className="bg-sentinel-red-light border border-sentinel-red/20 rounded-2xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-sentinel-red shrink-0" />
          <p className="text-sm font-medium text-sentinel-red">Guardian threshold not met — Hollow Keys suspended</p>
        </div>
      )}

      {/* Network Graph */}
      <div className="bg-card rounded-2xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="font-bold text-foreground">Guardian Network</h2>
            <p className="text-xs text-muted-foreground">Live shard distribution across trust boundaries</p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleKillSwitch} disabled={killSwitchActive}
              className="border border-sentinel-red text-sentinel-red px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-sentinel-red-light transition-colors disabled:opacity-50">
              Simulate Kill Switch
            </button>
            <button onClick={handleReset}
              className="border border-border text-muted-foreground px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-muted transition-colors">
              Reset
            </button>
          </div>
        </div>

        <svg viewBox="0 0 700 420" className="w-full h-auto max-h-[420px]">
          {/* Connection Lines */}
          {connections.map((conn) => {
            const from = getNodeById(conn.from);
            const to = getNodeById(conn.to);
            const isOffline = !from.online || !to.online;
            const midX = (from.x + to.x) / 2;
            const midY = (from.y + to.y) / 2;
            return (
              <g key={`${conn.from}-${conn.to}`}>
                <line
                  x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                  stroke={isOffline ? "#DC2626" : "#4F46E5"}
                  strokeWidth={1.5}
                  strokeDasharray={isOffline ? "6 4" : "none"}
                  opacity={isOffline ? 0.5 : 0.3}
                />
                <text x={midX} y={midY - 6} textAnchor="middle" className="fill-muted-foreground text-[9px] font-mono">
                  {conn.label}
                </text>
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => (
            <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
              <circle
                r={node.id === "mpc" ? 35 : 28}
                fill={node.fill}
                stroke={node.border}
                strokeWidth={2}
              />
              {/* Icon text placeholder */}
              <text textAnchor="middle" dy={4} className="fill-foreground text-xs font-medium">
                {node.id === "mpc" ? "⚙" : node.id === "nethunter" ? "📱" : node.id === "edge" ? "🖥" : "☁"}
              </text>
              {/* Label below */}
              <text textAnchor="middle" y={node.id === "mpc" ? 50 : 42} className="fill-foreground text-[11px] font-medium">
                {node.name}
              </text>
              <text textAnchor="middle" y={node.id === "mpc" ? 63 : 55} className="fill-muted-foreground text-[9px]">
                {node.subtext}
              </text>
              {/* Offline warning */}
              {!node.online && (
                <>
                  <circle r={node.id === "mpc" ? 35 : 28} fill="rgba(156,163,175,0.3)" />
                  <circle cx={20} cy={-20} r={8} fill="#DC2626" />
                  <text x={20} y={-16} textAnchor="middle" className="fill-primary-foreground text-[10px] font-bold">!</text>
                </>
              )}
            </g>
          ))}

          {/* Offline tooltip */}
          {killSwitchActive && (
            <g transform={`translate(${getNodeById("nethunter").x}, ${getNodeById("nethunter").y - 50})`}>
              <rect x={-95} y={-14} width={190} height={28} rx={6} fill="white" stroke="#DC2626" strokeWidth={1} />
              <rect x={-95} y={-14} width={3} height={28} rx={1} fill="#DC2626" />
              <text textAnchor="middle" dy={4} className="fill-foreground text-[10px]">Guardian offline — threshold at risk</text>
            </g>
          )}
        </svg>
      </div>

      {/* Guardian Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {guardianCards.map((g, i) => {
          const isOffline = killSwitchActive && g.name === "NetHunter Device";
          return (
            <div key={i} className={`bg-card rounded-xl shadow-sm p-4 border-l-[3px] ${isOffline ? "border-l-sentinel-red" : "border-l-sentinel-green"}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-foreground">{g.name}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isOffline ? "bg-sentinel-red-light text-sentinel-red" : "bg-sentinel-green-light text-sentinel-green"}`}>
                  {isOffline ? "Offline" : "Online"}
                </span>
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <span className="font-mono">{g.shard}</span>
                  <CopyButton text={g.shard} />
                </div>
                <div>Ping: <span className="font-mono">{g.ping}</span></div>
                <div>Latency: <span className="font-mono">{g.latency}</span></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Key Reconstruction Test */}
      <div className="bg-card rounded-2xl shadow-sm p-5">
        <h2 className="font-bold text-foreground mb-4">Key Reconstruction Test</h2>
        <div className="flex items-center gap-4">
          <input
            value={testInput}
            onChange={(e) => setTestInput(e.target.value)}
            className="flex-1 max-w-md px-3 py-2 rounded-lg border border-border bg-card font-mono text-sm"
            placeholder="Enter Hollow Key UUID..."
          />
          <button onClick={handleTest}
            className="bg-sentinel-indigo text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
            Test Reconstruction
          </button>
          {testResult && (
            <span className={`text-sm font-medium px-3 py-1.5 rounded-full ${testResult === "pass" ? "bg-sentinel-green-light text-sentinel-green" : "bg-sentinel-red-light text-sentinel-red"}`}>
              {testResult === "pass" ? "3/5 Guardians — Authorized" : "2/5 Guardians — Threshold Not Met"}
            </span>
          )}
        </div>
        {testResult === "fail" && (
          <p className="text-xs text-muted-foreground mt-2">NetHunter is offline. Minimum 3 guardians required for key reconstruction.</p>
        )}
      </div>
    </div>
  );
}
