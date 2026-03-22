import { useState, useEffect } from "react";
import { SeverityBadge } from "@/components/SeverityBadge";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_WS_URL);

const severities = ["all", "critical", "high", "medium", "low", "info"] as const;

const ghostReviewerVectors = [
  { name: "DNS tunneling via TXT records", category: "Exfiltration", result: "Blocked", patched: true },
  { name: "Prompt override via system prefix", category: "Injection", result: "Blocked", patched: true },
  { name: "Direct shard file read", category: "Theft", result: "Blocked", patched: false },
  { name: "Memory dump via /proc access", category: "Exfiltration", result: "Success", patched: true },
  { name: "Time-based side channel on enclave", category: "Side Channel", result: "Blocked", patched: false },
];

export default function AttacksPage() {
  const [attacks, setAttacks] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("payload");

  useEffect(() => {
    socket.on("attack.detected", (data) => {
      console.log("✏️ Attack Detected:", data);
      const newAttack = {
        id: data.eventId,
        severity: data.severity as any,
        type: "Attack Detected",
        agent: data.service,
        action: `Attack detected on service: ${data.service}`,
        response: "Blocked",
        time: new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
        payload: data.payload,
        authIntent: "Checking compliance",
        detectedIntent: "Security Violation",
        fix: "Immediate action: service isolation and log analysis recommended."
      };
      setAttacks((prev) => [newAttack, ...prev]);
    });

    return () => {
      socket.off("attack.detected");
    };
  }, []);

  const filtered = filter === "all" ? attacks : attacks.filter((a) => a.severity === filter);

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="bg-card rounded-2xl shadow-sm px-5 py-3 flex items-center gap-2 border-b border-border">
        {severities.map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors capitalize ${filter === s ? "bg-sentinel-indigo text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
            {s === "all" ? "All" : s}
          </button>
        ))}
      </div>

      {/* Attack Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((attack) => (
          <div key={attack.id} className="bg-card rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <SeverityBadge severity={attack.severity} />
                <span className="text-xs text-muted-foreground">{attack.type}</span>
              </div>
              <div className="mb-2">
                <span className="text-xs text-muted-foreground">Agent </span>
                <span className="font-mono text-sm text-foreground">{attack.agent}</span>
              </div>
              <div className="mb-3">
                <span className="text-xs text-muted-foreground">Attempted </span>
                <span className="text-sm font-medium text-foreground">{attack.action}</span>
              </div>
              <div className="border-t border-border pt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Response:</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${attack.response === "Blocked" ? "bg-sentinel-green-light text-sentinel-green" : attack.response === "Quarantined" ? "bg-sentinel-amber-light text-sentinel-amber" : "bg-sentinel-indigo-light text-sentinel-indigo"}`}>
                    {attack.response}
                  </span>
                </div>
                <button onClick={() => setExpandedId(expandedId === attack.id ? null : attack.id)} className="text-muted-foreground hover:text-foreground">
                  {expandedId === attack.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {expandedId === attack.id && (
              <div className="border-t border-border">
                <div className="flex border-b border-border">
                  {["payload", "intent", "fix"].map((tab) => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                      className={`flex-1 text-xs font-medium py-2.5 transition-colors capitalize ${activeTab === tab ? "text-sentinel-indigo border-b-2 border-sentinel-indigo" : "text-muted-foreground"}`}>
                      {tab === "payload" ? "Packet Payload" : tab === "intent" ? "Intent Analysis" : "Fix Recommendation"}
                    </button>
                  ))}
                </div>
                <div className="p-4">
                  {activeTab === "payload" && (
                    <pre className="bg-[#1E293B] text-slate-300 p-3 rounded-lg text-xs font-mono overflow-x-auto">{attack.payload}</pre>
                  )}
                  {activeTab === "intent" && (
                    <div className="flex gap-3 items-center">
                      <div className="flex-1 border-2 border-sentinel-green rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-1">Authorized Intent</p>
                        <p className="text-sm font-medium text-foreground">{attack.authIntent}</p>
                      </div>
                      <X className="w-5 h-5 text-sentinel-red shrink-0" />
                      <div className="flex-1 border-2 border-sentinel-red rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-1">Detected Intent</p>
                        <p className="text-sm font-medium text-foreground">{attack.detectedIntent}</p>
                      </div>
                    </div>
                  )}
                  {activeTab === "fix" && (
                    <div className="bg-sentinel-indigo-light rounded-lg p-3">
                      <p className="text-sm text-foreground">{attack.fix}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Ghost Reviewer Summary */}
      <div className="bg-card rounded-2xl shadow-sm p-5">
        <h2 className="font-bold text-foreground mb-4">Ghost Reviewer — Last Red Team Session</h2>
        <div className="flex gap-4 mb-4">
          <span className="bg-muted px-3 py-1.5 rounded-full text-xs font-medium text-foreground">5 attack vectors tried</span>
          <span className="bg-sentinel-red-light px-3 py-1.5 rounded-full text-xs font-medium text-sentinel-red">1 bypassed</span>
          <span className="bg-sentinel-indigo-light px-3 py-1.5 rounded-full text-xs font-medium text-sentinel-indigo">3 rules auto-patched</span>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-xs font-medium text-muted-foreground py-2">Vector Name</th>
              <th className="text-left text-xs font-medium text-muted-foreground py-2">Category</th>
              <th className="text-left text-xs font-medium text-muted-foreground py-2">Result</th>
              <th className="text-left text-xs font-medium text-muted-foreground py-2">Patch Applied</th>
            </tr>
          </thead>
          <tbody>
            {ghostReviewerVectors.map((v, i) => (
              <tr key={i} className="border-b border-border last:border-0">
                <td className="py-2.5 text-sm text-foreground">{v.name}</td>
                <td className="py-2.5 text-sm text-muted-foreground">{v.category}</td>
                <td className="py-2.5">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${v.result === "Blocked" ? "bg-sentinel-green-light text-sentinel-green" : "bg-sentinel-red-light text-sentinel-red"}`}>
                    {v.result}
                  </span>
                </td>
                <td className="py-2.5">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${v.patched ? "bg-sentinel-green-light text-sentinel-green" : "bg-muted text-muted-foreground"}`}>
                    {v.patched ? "Yes" : "No"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
