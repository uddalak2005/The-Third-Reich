import { useState, useEffect } from "react";
import { Key, Plus, X, Check, Copy } from "lucide-react";
import { CopyButton } from "@/components/CopyButton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const auditEvents = [
  {
    type: "Key Issued",
    color: "bg-sentinel-indigo",
    detail: "Issued for OpenAI, intent: analyze-csv, expiry: 24h",
    time: "12:00:01",
  },
  {
    type: "Key Used",
    color: "bg-sentinel-green",
    detail: "Called OpenAI GPT-4, response: 340ms, trace: tr-9a2f",
    time: "12:02:14",
  },
  {
    type: "Shard Requested",
    color: "bg-sentinel-amber",
    detail: "3 shards fetched from AWS, GCP, Edge",
    time: "12:02:14",
  },
  {
    type: "Key Used",
    color: "bg-sentinel-green",
    detail: "Called OpenAI GPT-4, response: 280ms, trace: tr-b4c1",
    time: "12:04:32",
  },
];

export default function KeysPage() {
  const [issueOpen, setIssueOpen] = useState(false);
  const [issued, setIssued] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [service, setService] = useState("Custom");
  const [expiry, setExpiry] = useState("24h");

  const [realApiKey, setRealApiKey] = useState("");
  const [agentId, setAgentId] = useState("");
  const [name, setName] = useState("");
  const [agentName, setAgentName] = useState("");
  const [allowedIntent, setAllowedIntent] = useState("");
  const [keys, setKeys] = useState<any[]>([]);

  useEffect(() => {
    const fetchKeys = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/keys/vault/getKeys`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: "uddalak2005",
            }),
          },
        );
        if (response.ok) {
          const data = await response.json();
          const keysList = Array.isArray(data) ? data : data.keys || [];
          const formattedKeys = keysList.map((hk: any) => ({
            id: hk.id,
            service: hk.provider,
            agent: hk.agentName,
            status: hk.status?.toLowerCase() || "active",
            used: hk.timesUsed,
            lastUsed: hk.lastUsedAt
              ? new Date(hk.lastUsedAt).toLocaleDateString()
              : "never",
          }));
          setKeys(formattedKeys);
        }
      } catch (error) {
        console.error("Failed to fetch keys:", error);
      }
    };
    fetchKeys();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/keys/vault/registerKey`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            realApiKey,
            agentId,
            name,
            userId: "uddalak2005",
            agentName,
            provider: "groq",
            allowedIntent,
            expiresAt: "2026-12-31T23:59:59Z",
          }),
        },
      );

      if (response.ok) {
        const data = await response.json();
        if (data.hollowKey) {
          const hk = data.hollowKey;
          setKeys((prev) => [
            {
              id: hk.id,
              service: hk.provider,
              agent: hk.agentName,
              status: hk.status?.toLowerCase() || "active",
              used: hk.timesUsed,
              lastUsed: "just now",
            },
            ...prev,
          ]);
        }
        setIssued(true);
      } else {
        console.error("Failed to issue key", response);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleRevoke = async (keyId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    // Update local state immediately
    setKeys((prev) =>
      prev.map((k) => (k.id === keyId ? { ...k, status: "revoked" } : k)),
    );

    // Optional: Attempt to call backend to sync the revocation
    try {
      await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/keys/vault/revoke/${keyId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: "uddalak2005",
          }),
        },
      );
    } catch (error) {
      console.error("Failed to revoke key on server", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div />
        <Sheet
          open={issueOpen}
          onOpenChange={(open) => {
            setIssueOpen(open);
            if (!open) setIssued(false);
          }}
        >
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
                <h3 className="font-bold text-foreground">
                  Key Issued Successfully
                </h3>
                <div className="bg-muted rounded-lg p-3 font-mono text-sm flex items-center justify-between">
                  <span className="truncate">{keys[0]?.id}</span>
                  <CopyButton text="hk-copy" />
                </div>
                <p className="text-xs text-muted-foreground">
                  The real API key is never shown or stored here.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">
                    Service
                  </label>
                  <div className="flex gap-2">
                    {["Custom"].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setService(s)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${service === s ? "bg-sentinel-indigo text-primary-foreground" : "bg-muted text-foreground"}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">
                    Name
                  </label>
                  <input
                    className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm"
                    placeholder="e.g. GRQO THE THIRD REICH"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">
                    Real API Key
                  </label>
                  <input
                    className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm"
                    placeholder="Enter real API key"
                    type="password"
                    value={realApiKey}
                    onChange={(e) => setRealApiKey(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">
                    Agent ID
                  </label>
                  <input
                    className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm"
                    placeholder="e.g. groq-llama"
                    value={agentId}
                    onChange={(e) => setAgentId(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">
                    Agent Name
                  </label>
                  <input
                    className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm"
                    placeholder="e.g. Meta LLAMA"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">
                    Allowed Intent
                  </label>
                  <input
                    className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm"
                    placeholder="e.g. Access AI chat capabilities for testing purposes"
                    value={allowedIntent}
                    onChange={(e) => setAllowedIntent(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">
                    Expiry
                  </label>
                  <div className="flex gap-2">
                    {["24h", "7d", "30d", "Never"].map((e) => (
                      <button
                        key={e}
                        type="button"
                        onClick={() => setExpiry(e)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${expiry === e ? "bg-sentinel-indigo text-primary-foreground" : "bg-muted text-foreground"}`}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-sentinel-indigo text-primary-foreground py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
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
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                Key ID
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                Service
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                Agent
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                Status
              </th>
              <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                Times Used
              </th>
              <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                Last Used
              </th>
              <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {keys.map((key) => (
              <tr
                key={key.id}
                onClick={() => setSelectedKey(key.id)}
                className={`border-b border-border cursor-pointer transition-colors hover:bg-muted/50 ${selectedKey === key.id ? "bg-accent" : ""}`}
              >
                <td className="px-5 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-sm">
                      {key.id.slice(0, 12)}…
                    </span>
                    <CopyButton text={key.id} />
                  </div>
                </td>
                <td className="px-5 py-3 text-sm">{key.service}</td>
                <td className="px-5 py-3 text-sm">{key.agent}</td>
                <td className="px-5 py-3">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${key.status === "active" ? "bg-sentinel-green-light text-sentinel-green" : "bg-muted text-muted-foreground"}`}
                  >
                    {key.status === "active" ? "Active" : "Revoked"}
                  </span>
                </td>
                <td className="px-5 py-3 text-sm text-right">{key.used}</td>
                <td className="px-5 py-3 text-right font-mono text-xs text-muted-foreground">
                  {key.lastUsed}
                </td>
                <td className="px-5 py-3 text-right">
                  {key.status === "active" && (
                    <button
                      className="text-xs text-sentinel-red hover:underline"
                      onClick={(e) => handleRevoke(key.id, e)}
                    >
                      Revoke
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Key Detail Panel */}
      <Sheet
        open={!!selectedKey}
        onOpenChange={(open) => !open && setSelectedKey(null)}
      >
        <SheetContent>
          <SheetHeader>
            <SheetTitle className="font-mono text-sm">
              {selectedKey?.slice(0, 16)}…
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-0 relative">
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />
            {auditEvents.map((event, i) => (
              <div key={i} className="flex gap-4 py-3 relative">
                <span
                  className={`w-3.5 h-3.5 rounded-full ${event.color} shrink-0 mt-0.5 z-10 ring-2 ring-card`}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">
                      {event.type}
                    </span>
                    <span className="text-xs font-mono text-muted-foreground">
                      {event.time}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {event.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
