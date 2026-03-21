import { useState } from "react";
import { Key, Plus, X, Check, Copy } from "lucide-react";
import { CopyButton } from "@/components/CopyButton";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const mockKeys = [
  { id: "hk-7f3a-4b2c-9d1e-8a5f", service: "OpenAI", agent: "Agent Alpha", status: "active", used: 142, lastUsed: "2 min ago" },
  { id: "hk-2c91-8d4e-f7a1-3b9c", service: "Stripe", agent: "Agent Beta", status: "active", used: 89, lastUsed: "15 min ago" },
  { id: "hk-a29f-c7f1-6e3d-b4a2", service: "Anthropic", agent: "Agent Gamma", status: "revoked", used: 37, lastUsed: "2h ago" },
  { id: "hk-8d4e-3b9c-a29f-7f3a", service: "OpenAI", agent: "Agent Delta", status: "active", used: 256, lastUsed: "30s ago" },
  { id: "hk-f7a1-6e3d-2c91-c7f1", service: "Custom", agent: "Agent Epsilon", status: "active", used: 12, lastUsed: "1h ago" },
];

const auditEvents = [
  { type: "Key Issued", color: "bg-sentinel-indigo", detail: "Issued for OpenAI, intent: analyze-csv, expiry: 24h", time: "12:00:01" },
  { type: "Key Used", color: "bg-sentinel-green", detail: "Called OpenAI GPT-4, response: 340ms, trace: tr-9a2f", time: "12:02:14" },
  { type: "Shard Requested", color: "bg-sentinel-amber", detail: "3 shards fetched from AWS, GCP, Edge", time: "12:02:14" },
  { type: "Key Used", color: "bg-sentinel-green", detail: "Called OpenAI GPT-4, response: 280ms, trace: tr-b4c1", time: "12:04:32" },
];

export default function KeysPage() {
  const [issueOpen, setIssueOpen] = useState(false);
  const [issued, setIssued] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [service, setService] = useState("OpenAI");
  const [expiry, setExpiry] = useState("24h");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIssued(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div />
        <Sheet open={issueOpen} onOpenChange={(open) => { setIssueOpen(open); if (!open) setIssued(false); }}>
          <SheetTrigger asChild>
            <button className="flex items-center gap-2 bg-sentinel-indigo text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
              <Plus className="w-4 h-4" />
              Issue New Key
            </button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Issue New Hollow Key</SheetTitle>
            </SheetHeader>
            {issued ? (
              <div className="mt-8 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-sentinel-green-light mx-auto flex items-center justify-center">
                  <Check className="w-6 h-6 text-sentinel-green" />
                </div>
                <h3 className="font-bold text-foreground">Key Issued Successfully</h3>
                <div className="bg-muted rounded-lg p-3 font-mono text-sm flex items-center justify-between">
                  <span className="truncate">hk-{Math.random().toString(16).slice(2, 10)}-{Math.random().toString(16).slice(2, 10)}</span>
                  <CopyButton text="hk-copy" />
                </div>
                <p className="text-xs text-muted-foreground">The real API key is never shown or stored here.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Service</label>
                  <div className="flex gap-2">
                    {["OpenAI", "Stripe", "Anthropic", "Custom"].map((s) => (
                      <button key={s} type="button" onClick={() => setService(s)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${service === s ? "bg-sentinel-indigo text-primary-foreground" : "bg-muted text-foreground"}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Agent Name</label>
                  <input className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm" placeholder="e.g. Agent Alpha" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Allowed Intent</label>
                  <input className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm" placeholder="e.g. analyze local CSV file" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Expiry</label>
                  <div className="flex gap-2">
                    {["24h", "7d", "30d", "Never"].map((e) => (
                      <button key={e} type="button" onClick={() => setExpiry(e)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${expiry === e ? "bg-sentinel-indigo text-primary-foreground" : "bg-muted text-foreground"}`}>
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
                <button type="submit" className="w-full bg-sentinel-indigo text-primary-foreground py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity">
                  Submit
                </button>
              </form>
            )}
          </SheetContent>
        </Sheet>
      </div>

      {/* Keys Table */}
      <div className="bg-card rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Key ID</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Service</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Agent</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Status</th>
              <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">Times Used</th>
              <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">Last Used</th>
              <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockKeys.map((key) => (
              <tr key={key.id} onClick={() => setSelectedKey(key.id)}
                className={`border-b border-border cursor-pointer transition-colors hover:bg-muted/50 ${selectedKey === key.id ? "bg-accent" : ""}`}>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-sm">{key.id.slice(0, 12)}…</span>
                    <CopyButton text={key.id} />
                  </div>
                </td>
                <td className="px-5 py-3 text-sm">{key.service}</td>
                <td className="px-5 py-3 text-sm">{key.agent}</td>
                <td className="px-5 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${key.status === "active" ? "bg-sentinel-green-light text-sentinel-green" : "bg-muted text-muted-foreground"}`}>
                    {key.status === "active" ? "Active" : "Revoked"}
                  </span>
                </td>
                <td className="px-5 py-3 text-sm text-right">{key.used}</td>
                <td className="px-5 py-3 text-right font-mono text-xs text-muted-foreground">{key.lastUsed}</td>
                <td className="px-5 py-3 text-right">
                  {key.status === "active" && (
                    <button className="text-xs text-sentinel-red hover:underline" onClick={(e) => e.stopPropagation()}>Revoke</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Key Detail Panel */}
      <Sheet open={!!selectedKey} onOpenChange={(open) => !open && setSelectedKey(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle className="font-mono text-sm">{selectedKey?.slice(0, 16)}…</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-0 relative">
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />
            {auditEvents.map((event, i) => (
              <div key={i} className="flex gap-4 py-3 relative">
                <span className={`w-3.5 h-3.5 rounded-full ${event.color} shrink-0 mt-0.5 z-10 ring-2 ring-card`} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">{event.type}</span>
                    <span className="text-xs font-mono text-muted-foreground">{event.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{event.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
