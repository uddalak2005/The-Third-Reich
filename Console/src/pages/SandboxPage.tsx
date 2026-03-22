import { useState, useEffect } from "react";
import { StatCard } from "@/components/StatCard";
import {
  Terminal,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function SandboxPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Side panel state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [commandStr, setCommandStr] = useState("");
  const [image, setImage] = useState("python:3.11-alpine");
  const [intent, setIntent] = useState("run python script");
  const [executing, setExecuting] = useState(false);

  const fetchLogs = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/sandbox/logs`,
      );
      if (res.ok) {
        const data = await res.json();
        console.log(data);
        const logsList = Array.isArray(data) ? data : data.logs || [];
        const mappedLogs = logsList.map((l: any) => ({
          ...l, // Safe spread keeps stdout, stderr, etc.
          id:
            l.id ||
            l.sandboxId ||
            `sbx-${Math.random().toString(16).slice(2, 6)}`,
          tool: l.tool || (l.command ? l.command[0] : "cli"),
          created:
            l.created ||
            (l.executedAt
              ? new Date(l.executedAt).toLocaleTimeString("en-US", {
                  hour12: false,
                })
              : new Date().toLocaleTimeString("en-US", { hour12: false })),
          duration: l.durationMs ? `${l.durationMs}ms` : l.duration || "—",
          status: l.status?.toLowerCase() || "completed",
          cpu: l.cpu ?? l.metrics?.cpu ?? Math.floor(Math.random() * 40),
          mem: l.mem ?? l.metrics?.memory ?? Math.floor(Math.random() * 60),
          anomaly: l.anomaly || null,
        }));
        setLogs(mappedLogs);
      }
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleExecute = async (e: React.FormEvent) => {
    e.preventDefault();
    setExecuting(true);

    // Parse command string into an array, correctly handling strings wrapped in quotes
    const parsedCommand =
      commandStr
        .match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g)
        ?.map((s) => s.replace(/^['"]|['"]$/g, "")) || [];

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/sandbox/execute`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            command: parsedCommand,
            image: image,
            timeoutMs: 5000,
            intent: intent,
          }),
        },
      );
      if (res.ok) {
        setSheetOpen(false);
        setCommandStr("");
        fetchLogs();
      } else {
        console.error("Execution failed:", res);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setExecuting(false);
    }
  };

  const anomalyCount = logs.filter((l) => l.status === "anomaly").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="grid grid-cols-3 gap-4 flex-1 mr-4">
          <StatCard
            title="Total Sandboxes"
            value={logs.length}
            icon={Terminal}
          />
          <StatCard title="Avg Execution Time" value="15ms" icon={Clock} />
          <StatCard
            title="Anomalies Detected"
            value={anomalyCount}
            icon={AlertTriangle}
            valueColor={anomalyCount > 0 ? "text-sentinel-red" : undefined}
            iconColor={anomalyCount > 0 ? "text-sentinel-red" : undefined}
            iconBg={anomalyCount > 0 ? "bg-sentinel-red-light" : undefined}
          />
        </div>
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <button className="border border-sentinel-indigo text-sentinel-indigo px-4 py-2 rounded-lg text-sm font-medium hover:bg-sentinel-indigo-light transition-colors disabled:opacity-50 whitespace-nowrap">
              Simulate Malicious Execution
            </button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Execute Command in Sandbox</SheetTitle>
            </SheetHeader>
            <form onSubmit={handleExecute} className="mt-6 space-y-5">
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Command
                </label>
                <input
                  className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm"
                  placeholder="e.g. python3 -c 'print(2 + 2)'"
                  value={commandStr}
                  onChange={(e) => setCommandStr(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Docker Image
                </label>
                <input
                  className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm"
                  placeholder="e.g. python:3.11-alpine"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Intent
                </label>
                <input
                  className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm"
                  placeholder="e.g. run python script"
                  value={intent}
                  onChange={(e) => setIntent(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={executing}
                className="w-full bg-sentinel-indigo text-primary-foreground py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {executing ? "Executing..." : "Execute payload"}
              </button>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      <div className="bg-card rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <h2 className="font-bold text-foreground">Execution Log</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {[
                "Sandbox ID",
                "Tool Executed",
                "Created At",
                "Duration",
                "Status",
                "CPU",
                "Memory",
                "",
              ].map((h) => (
                <th
                  key={h}
                  className="text-left text-xs font-medium text-muted-foreground px-5 py-3"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {logs.map((log, i) => (
              <>
                <tr
                  key={log.id}
                  onClick={() =>
                    setExpandedId(expandedId === log.id ? null : log.id)
                  }
                  className={`border-b border-border transition-colors cursor-pointer hover:bg-muted/50 ${log.status === "anomaly" ? "border-l-[3px] border-l-sentinel-red" : ""} ${i === 0 && logs[0].status !== "creating" ? "" : ""}`}
                >
                  <td className="px-5 py-3 font-mono text-sm">
                    {log.id.slice(0, 12)}…
                  </td>
                  <td className="px-5 py-3 text-sm">{log.tool}</td>
                  <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                    {log.created}
                  </td>
                  <td className="px-5 py-3 font-mono text-xs">
                    {log.duration}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${log.status === "completed" ? "bg-sentinel-green-light text-sentinel-green" : log.status === "anomaly" ? "bg-sentinel-red-light text-sentinel-red" : log.status === "creating" ? "bg-sentinel-amber-light text-sentinel-amber" : "bg-muted text-muted-foreground"}`}
                    >
                      {log.status === "creating"
                        ? "Creating sandbox…"
                        : log.status.charAt(0).toUpperCase() +
                          log.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-sentinel-indigo rounded-full"
                        style={{ width: `${log.cpu}%` }}
                      />
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-sentinel-amber rounded-full"
                        style={{ width: `${log.mem}%` }}
                      />
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedId(expandedId === log.id ? null : log.id);
                      }}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {expandedId === log.id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </td>
                </tr>
                {expandedId === log.id && (
                  <tr key={`${log.id}-detail`}>
                    <td colSpan={8} className="px-5 py-4 bg-muted/50">
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            {log.stderr
                              ? "Standard Error (stderr)"
                              : "Standard Output (stdout)"}
                          </p>
                          <pre
                            className={`p-3 rounded-lg text-xs font-mono 
                            whitespace-pre-wrap max-h-48 overflow-y-auto 
                            ${log.stderr ? "bg-[#1E293B] text-red-400" : "bg-card text-foreground"}`}
                          >
                            {log.stderr
                              ? log.stderr
                              : log.stdout || "No output"}
                          </pre>
                        </div>
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
