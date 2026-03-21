import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Shield,
  Lock,
  Wifi,
  Box,
  Search,
  Server,
  Cpu,
  GitBranch,
} from "lucide-react";
import { motion } from "framer-motion";

// ─── Terminal data ───────────────────────────────────────────────────────────

const terminalLines = [
  { text: "[ OK ] Agent-7f3a authenticated via Hollow Key", type: "ok" },
  {
    text: "[ BLOCKED ] DNS exfiltration attempt by Agent-2c91",
    type: "blocked",
  },
  {
    text: "[ OK ] Hollow Key shard reconstructed — key destroyed in 4ms",
    type: "ok",
  },
  {
    text: "[ SYSTEM ] Intent Firewall rule updated — vector patched",
    type: "system",
  },
  {
    text: "[ OK ] Sandbox sbx-a29f executed cleanly — destroyed in 12ms",
    type: "ok",
  },
  {
    text: "[ BLOCKED ] Prompt injection detected on Agent-8d4e",
    type: "blocked",
  },
  { text: "[ OK ] Ghost Reviewer scan complete — 0 bypasses", type: "ok" },
  {
    text: "[ SYSTEM ] Capability Gateway verified agent permissions",
    type: "system",
  },
  {
    text: "[ BLOCKED ] Shard theft attempt from external IP 41.92.x.x",
    type: "blocked",
  },
  {
    text: "[ OK ] Model DNA scan passed — no dormant backdoors found",
    type: "ok",
  },
  {
    text: "[ SYSTEM ] Ghost-Reviewer patched 1 new privilege escalation vector",
    type: "system",
  },
  {
    text: "[ OK ] Agent-c7f1 key rotated — memory cryptographically incinerated",
    type: "ok",
  },
];

const lineColors: Record<string, string> = {
  ok: "text-emerald-400",
  blocked: "text-red-400",
  system: "text-indigo-400",
};

// ─── Shared animation constants ──────────────────────────────────────────────

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const viewport = { once: true, amount: 0.2 };

// ─── Terminal ────────────────────────────────────────────────────────────────

function TerminalAnimation() {
  const [visibleLines, setVisibleLines] = useState<typeof terminalLines>([]);

  useEffect(() => {
    let idx = 0;
    const interval = setInterval(() => {
      setVisibleLines((prev) => {
        const next = [...prev, terminalLines[idx % terminalLines.length]];
        if (next.length > 8) next.shift();
        return next;
      });
      idx++;
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-[700px] mx-auto bg-[#0F172A] rounded-2xl shadow-2xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1E293B]">
        <span className="w-3 h-3 rounded-full bg-red-500" />
        <span className="w-3 h-3 rounded-full bg-yellow-500" />
        <span className="w-3 h-3 rounded-full bg-green-500" />
        <span className="ml-2 text-xs text-slate-500 font-mono">
          spectr-0 — control-plane
        </span>
      </div>
      <div className="p-4 h-[220px] flex flex-col justify-end font-mono text-sm">
        {visibleLines.map((line, i) => (
          <div
            key={i}
            className={`${lineColors[line.type]} animate-terminal-line leading-relaxed`}
          >
            {line.text}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Static data ─────────────────────────────────────────────────────────────

const features = [
  {
    icon: Lock,
    title: "Hollow-Key Protocol",
    subtitle: "Cryptographic Zero-Trust Inference Engine",
    desc: "API keys are mathematically shattered into shards using Shamir's Secret Sharing and distributed across cloud enclaves, edge nodes, and air-gapped storage. Each key is reconstructed only inside a Trusted Execution Environment for a few milliseconds to sign a single request — then cryptographically incinerated. Zero persistent key exposure, by design.",
  },
  {
    icon: Wifi,
    title: "Intent-Layer Runtime Firewall",
    subtitle: "Kernel-Level eBPF Threat Interception",
    desc: "Operating at the kernel level, eBPF probes intercept every network packet before it reaches the interface. A Small Language Model performs semantic validation, checking whether network activity logically aligns with the agent's assigned task. Mismatched intent? The packet is dropped, the agent is suspended, and the event is logged.",
  },
  {
    icon: Box,
    title: "Ephemeral Execution Void",
    subtitle: "WebAssembly Micro-VM + Model DNA Scanner",
    desc: "Every tool call — shell commands, database queries, web requests — executes inside a WebAssembly micro-VM with a lifetime of 1–50 ms, no host OS access, and no persistent filesystem. Before deployment, the Model DNA Scanner inspects model weights forensically to detect dormant backdoors, data poisoning, and malicious gradient signatures.",
  },
  {
    icon: Search,
    title: "Ghost Reviewer",
    subtitle: "Autonomous Adversarial Immune System",
    desc: "A reinforcement-learning-driven red-team swarm continuously evolves attacks against the platform — prompt injection strategies, VM escape attempts, firewall evasion, and agent privilege escalation. When a vulnerability is discovered, the system auto-generates a security patch, updates the policy engine, and hardens the affected subsystem without human intervention.",
  },
];

const steps = [
  {
    num: 1,
    title: "Issue Hollow Key",
    desc: "Generate a shard-distributed key for any API service. Shards are stored across isolated infrastructure — cloud enclaves, edge nodes, and air-gapped storage. The plaintext key never exists in memory.",
  },
  {
    num: 2,
    title: "Agent Makes Request",
    desc: "The AI agent references the hollow key to initiate an API call. The Capability Gateway authenticates and authorizes the agent's identity before any action proceeds.",
  },
  {
    num: 3,
    title: "Intent Validated",
    desc: "The eBPF-powered Intent Firewall intercepts the outbound packet at the kernel level. A Small Language Model verifies the request semantically aligns with the agent's authorized task scope.",
  },
  {
    num: 4,
    title: "Enclave Reconstructs",
    desc: "Key shards are assembled inside a Trusted Execution Environment for milliseconds to sign the request. Immediately after, the key memory is cryptographically incinerated — leaving zero recoverable trace.",
  },
];

const layers = [
  {
    icon: Lock,
    layer: "Cryptographic",
    mechanism: "Hollow-Key Protocol with Shamir's Secret Sharing",
    color: "text-violet-400",
    bg: "bg-violet-400/10",
  },
  {
    icon: Cpu,
    layer: "Kernel",
    mechanism: "Intent-aware eBPF firewall with SLM semantic validation",
    color: "text-sky-400",
    bg: "bg-sky-400/10",
  },
  {
    icon: Server,
    layer: "Execution",
    mechanism: "Ephemeral WebAssembly micro-VM sandbox + Model DNA Scanner",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
  },
  {
    icon: GitBranch,
    layer: "Intelligence",
    mechanism: "RL adversarial Ghost-Reviewer red-team swarm",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
  },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-card">
      {/* ── Navbar ── */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="sticky top-0 z-50 bg-card border-b border-border"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-14">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-sentinel-indigo" />
            <span className="font-bold text-foreground">SPECTR-0</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {["Features", "How It Works", "Layers", "Team"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/ /g, "-")}`}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {item}
              </a>
            ))}
          </div>
          <Link
            to="/dashboard"
            className="bg-sentinel-indigo text-primary-foreground 
            px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Launch Dashboard
          </Link>

          {/* <Link
            to="/#"
            className="bg-sentinel-indigo text-primary-foreground 
            px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Connect a service
          </Link> */}
        </div>
      </motion.nav>

      {/* ── Hero ── */}
      <section className="pt-24 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1, ease: EASE }}
            className="inline-flex items-center gap-2 bg-sentinel-indigo/10 text-sentinel-indigo text-xs font-semibold px-3 py-1 rounded-full mb-6 border border-sentinel-indigo/20"
          >
            <Shield className="w-3 h-3" />
            End-to-End AI Security Platform
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.23, ease: EASE }}
            className="text-5xl md:text-6xl font-bold text-foreground leading-tight mb-6"
          >
            Secure Multi-Agent AI.
            <br />
            <span className="text-sentinel-indigo">
              Zero Trust. Zero Secrets. Zero Compromise.
            </span>
          </motion.h1>

          {/* Sub-text */}
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.36, ease: EASE }}
            className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto"
          >
            SPECTR-0 protects modern AI systems simultaneously at the{" "}
            <strong className="text-foreground">
              cryptographic, kernel, execution, and intelligence layers
            </strong>{" "}
            — addressing the full threat surface of next-generation agentic
            infrastructure.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.49, ease: EASE }}
            className="flex items-center justify-center gap-4 mb-16"
          >
            <Link
              to="/dashboard"
              className="bg-sentinel-indigo text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Launch Dashboard
            </Link>
            <button className="border border-sentinel-indigo text-sentinel-indigo px-6 py-3 rounded-lg font-medium hover:bg-sentinel-indigo-light transition-colors">
              Read the Docs
            </button>
          </motion.div>

          {/* Terminal */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.62, ease: EASE }}
          >
            <TerminalAnimation />
          </motion.div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-20 px-6 bg-card">
        <div className="max-w-6xl mx-auto">
          {/* Section heading */}
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewport}
              transition={{ duration: 0.65, ease: EASE }}
              className="text-3xl font-bold text-foreground mb-3"
            >
              Built for the Agentic Era
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewport}
              transition={{ duration: 0.65, delay: 0.1, ease: EASE }}
              className="text-muted-foreground max-w-xl mx-auto text-sm"
            >
              Traditional security was built for humans. SPECTR-0 was built for
              autonomous AI agents that operate at machine speed across
              distributed infrastructure.
            </motion.p>
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 32, scale: 0.97 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={viewport}
                transition={{ duration: 0.55, delay: i * 0.13, ease: EASE }}
                className="bg-card border border-border shadow-sm rounded-2xl p-6"
              >
                <div className="w-10 h-10 rounded-lg bg-sentinel-indigo-light flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-sentinel-indigo" />
                </div>
                <p className="text-xs text-sentinel-indigo font-semibold uppercase tracking-widest mb-1">
                  {f.subtitle}
                </p>
                <h3 className="font-bold text-foreground mb-2 text-lg">
                  {f.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-20 px-6 bg-sidebar">
        <div className="max-w-6xl mx-auto">
          {/* Section heading */}
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewport}
              transition={{ duration: 0.65, ease: EASE }}
              className="text-3xl font-bold text-foreground mb-3"
            >
              How It Works
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewport}
              transition={{ duration: 0.65, delay: 0.1, ease: EASE }}
              className="text-muted-foreground max-w-xl mx-auto text-sm"
            >
              Every agent interaction passes through a coordinated multi-layer
              security pipeline — from key issuance through to cryptographic
              incineration — in milliseconds.
            </motion.p>
          </div>

          {/* Steps */}
          <div className="flex flex-col md:flex-row items-start justify-between gap-4 relative">
            {/* Dashed line */}
            <div className="hidden md:block absolute top-6 left-[10%] right-[10%] h-px border-t-2 border-dashed border-border" />

            {steps.map((s, i) => (
              <motion.div
                key={s.num}
                initial={{ opacity: 0, y: 32, scale: 0.97 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={viewport}
                transition={{ duration: 0.55, delay: i * 0.15, ease: EASE }}
                className="flex-1 text-center relative z-10"
              >
                <div className="w-12 h-12 rounded-full bg-sentinel-indigo text-primary-foreground flex items-center justify-center text-lg font-bold mx-auto mb-4">
                  {s.num}
                </div>
                <h3 className="font-bold text-foreground mb-2 text-sm">
                  {s.title}
                </h3>
                <p className="text-xs text-muted-foreground max-w-[200px] mx-auto leading-relaxed">
                  {s.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Protection Layers ── */}
      <section id="layers" className="py-20 px-6 bg-card">
        <div className="max-w-5xl mx-auto">
          {/* Section heading */}
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewport}
              transition={{ duration: 0.65, ease: EASE }}
              className="text-3xl font-bold text-foreground mb-3"
            >
              Four Fundamental Protection Layers
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewport}
              transition={{ duration: 0.65, delay: 0.1, ease: EASE }}
              className="text-muted-foreground max-w-xl mx-auto text-sm"
            >
              SPECTR-0 defends AI systems across every layer of the stack
              simultaneously — from cryptographic key management at the bottom
              to autonomous adversarial intelligence at the top.
            </motion.p>
          </div>

          {/* Layer cards — alternating slide directions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {layers.map((l, i) => (
              <motion.div
                key={l.layer}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={viewport}
                transition={{ duration: 0.55, delay: i * 0.07, ease: EASE }}
                className="flex items-start gap-4 border border-border rounded-2xl p-5 bg-card"
              >
                <div
                  className={`w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center ${l.bg}`}
                >
                  <l.icon className={`w-5 h-5 ${l.color}`} />
                </div>
                <div>
                  <p
                    className={`text-xs font-bold uppercase tracking-widest mb-1 ${l.color}`}
                  >
                    {l.layer} Layer
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {l.mechanism}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Closing statement */}
          <motion.p
            className="text-center text-sm text-muted-foreground mt-10 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewport}
            transition={{ duration: 0.65, ease: EASE }}
          >
            Together, these four layers form a{" "}
            <strong className="text-foreground">
              zero-trust, self-defending AI infrastructure
            </strong>{" "}
            — coordinated by the Capability Gateway and continuously hardened by
            the Ghost-Reviewer adversarial immune system.
          </motion.p>
        </div>
      </section>

      {/* ── Footer ── */}
      <motion.footer
        className="border-t border-border py-8 text-center"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={viewport}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <Shield className="w-4 h-4 text-sentinel-indigo" />
          <span className="font-bold text-foreground text-sm">SPECTR-0</span>
        </div>
        <p className="text-sm text-muted-foreground">
          End-to-End AI Security Platform — Zero Trust, Self-Defending, Built
          for Agentic Systems.
        </p>
      </motion.footer>
    </div>
  );
}
