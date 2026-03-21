
'use strict';

// ─── Policy enum ──────────────────────────────────────────────────────────────

/** Maps to policy IDs in policy.yaml */
const Policy = Object.freeze({
  RESTRICTED:  1,   // HTTPS only, no external net, blocks on injection
  INTERNAL:    2,   // Internal APIs + DB ports, no external net
  TRUSTED:     3,   // Full access, external net OK, injection alerts only
  QUARANTINE:  4,   // All traffic blocked — for compromised agents
});

/** Reverse map: id → name */
const PolicyName = Object.freeze({
  1: 'restricted',
  2: 'internal',
  3: 'trusted',
  4: 'quarantine',
});

// ─── HTTP client (zero dependencies — uses built-in http/https) ──────────────

function _request(url, method, body) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const mod    = parsed.protocol === 'https:' ? require('https') : require('http');
    const data   = body ? JSON.stringify(body) : null;

    const options = {
      hostname: parsed.hostname,
      port:     parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
      path:     parsed.pathname + parsed.search,
      method:   method,
      headers:  {
        'Content-Type':   'application/json',
        'User-Agent':     'agentguard-js-sdk/1.0',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    };

    const req = mod.request(options, (res) => {
      let raw = '';
      res.on('data', (chunk) => { raw += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(raw) });
        } catch {
          resolve({ status: res.statusCode, body: raw });
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(8000, () => { req.destroy(new Error('AgentGuard request timeout')); });
    if (data) req.write(data);
    req.end();
  });
}

// ─── AgentGuard client ────────────────────────────────────────────────────────

class AgentGuard {
  /**
   * @param {object} options
   * @param {string} [options.daemonUrl]      AgentGuard daemon URL
   * @param {boolean} [options.autoDeregister] Unregister on process exit (default: true)
   * @param {boolean} [options.verbose]        Print log lines (default: false)
   */
  constructor(options = {}) {
    this.daemonUrl       = (options.daemonUrl
                            || process.env.AGENTGUARD_URL
                            || 'http://localhost:8080').replace(/\/$/, '');
    this.autoDeregister  = options.autoDeregister !== false;
    this.verbose         = options.verbose || false;

    this.pid             = process.pid;
    this.registered      = false;
    this._agentName      = null;

    if (this.autoDeregister) {
      const self = this;
      const cleanup = () => { self.unregisterSync(); };
      process.on('exit',    cleanup);
      process.on('SIGINT',  () => { cleanup(); process.exit(0); });
      process.on('SIGTERM', () => { cleanup(); process.exit(0); });
    }
  }

  // ── Registration ──────────────────────────────────────────────────────────

  /**
   * Register this process with the AgentGuard daemon.
   *
   * @param {string} name       Human-readable agent name
   * @param {number} [policy]   Policy ID from Policy enum (default: Policy.RESTRICTED)
   * @param {string[]} [tags]   Optional metadata tags
   * @returns {Promise<object>} Registration response
   *
   * @example
   *   const guard = new AgentGuard();
   *   await guard.register('langchain-retrieval-agent', Policy.INTERNAL);
   */
  async register(name, policy = Policy.RESTRICTED, tags = []) {
    this._agentName = name;
    try {
      const res = await _request(
        `${this.daemonUrl}/api/agents/register`,
        'POST',
        { pid: this.pid, name, policy_id: policy, tags },
      );
      if (res.status === 201 || res.status === 200) {
        this.registered = true;
        this._log(`Registered: ${name} | policy=${PolicyName[policy] || policy} | pid=${this.pid}`);
        return res.body;
      } else {
        this._warn(`Registration failed: HTTP ${res.status}`, res.body);
        return res.body;
      }
    } catch (err) {
      this._warn(`Cannot reach AgentGuard daemon at ${this.daemonUrl}: ${err.message}`);
      return null;
    }
  }

  /**
   * Unregister this process. Called automatically on exit if autoDeregister=true.
   * @returns {Promise<void>}
   */
  async unregister() {
    if (!this.registered) return;
    try {
      await _request(
        `${this.daemonUrl}/api/agents/${this.pid}/unregister`,
        'POST',
      );
      this.registered = false;
      this._log(`Unregistered: ${this._agentName} | pid=${this.pid}`);
    } catch {
      // Silent — process may be shutting down
    }
  }

  /** Synchronous unregister for process.on('exit') — uses spawnSync under the hood */
  unregisterSync() {
    if (!this.registered) return;
    try {
      const { execFileSync } = require('child_process');
      execFileSync(process.execPath, [
        '-e',
        `const h=require('http');const r=h.request({hostname:'${new URL(this.daemonUrl).hostname}',port:${new URL(this.daemonUrl).port||80},path:'/api/agents/${this.pid}/unregister',method:'POST'},()=>{});r.end();`,
      ], { timeout: 1000 });
    } catch { /* silent */ }
    this.registered = false;
  }

  // ── Tool call reporting ───────────────────────────────────────────────────

  /**
   * Report a tool call before execution.
   * Allows AgentGuard to pre-emptively evaluate it against policy.
   *
   * @param {string} tool   Tool name (e.g. "web_search", "shell_exec")
   * @param {object} args   Tool arguments
   * @returns {Promise<{verdict: string}>}  "allow" | "block"
   *
   * @example
   *   const result = await guard.reportToolCall('shell_exec', { cmd: 'ls -la' });
   *   if (result?.verdict === 'block') return; // AgentGuard blocked this
   */
  async reportToolCall(tool, args = {}) {
    if (!this.registered) return { verdict: 'allow' };
    try {
      const res = await _request(
        `${this.daemonUrl}/api/agents/${this.pid}/tool_call`,
        'POST',
        { tool, args },
      );
      return res.body;
    } catch {
      return { verdict: 'allow' }; // fail-open so agent isn't blocked by daemon downtime
    }
  }

  // ── Policy management ─────────────────────────────────────────────────────

  /**
   * Change the active policy for this agent at runtime.
   * @param {number} policyId  New policy ID from Policy enum
   */
  async setPolicy(policyId) {
    try {
      const res = await _request(
        `${this.daemonUrl}/api/agents/${this.pid}/policy?policy_id=${policyId}`,
        'POST',
      );
      this._log(`Policy changed to ${PolicyName[policyId] || policyId}`);
      return res.body;
    } catch (err) {
      this._warn(`setPolicy failed: ${err.message}`);
      return null;
    }
  }

  // ── Proxy configuration ───────────────────────────────────────────────────

  /**
   * Configure HTTP_PROXY and HTTPS_PROXY so all outbound HTTP requests
   * from this process flow through AgentGuard's inspection proxy.
   *
   * Call this BEFORE making any HTTP requests.
   * Works with: axios, node-fetch, undici, got, superagent, https.request.
   *
   * @param {string} [proxyUrl]  Override proxy URL (default: http://localhost:8888)
   *
   * @example
   *   const guard = new AgentGuard();
   *   guard.useProxy();               // now all HTTP goes through AgentGuard
   *   await guard.register('my-agent', Policy.RESTRICTED);
   */
  useProxy(proxyUrl) {
    const url = proxyUrl || process.env.AGENTGUARD_PROXY_URL || 'http://localhost:8888';
    process.env.HTTP_PROXY  = url;
    process.env.HTTPS_PROXY = url;
    process.env.http_proxy  = url;
    process.env.https_proxy = url;
    // node-fetch v3 / undici require explicit agent — print a helpful warning
    this._log(`Proxy configured: ${url}`);
    this._log('Note: For node-fetch v3+ / undici, pass a ProxyAgent explicitly.');
    this._log('See: https://github.com/gajus/global-agent for automatic proxy support.');
    return url;
  }

  // ── Stats & health ────────────────────────────────────────────────────────

  /** @returns {Promise<object>} Current daemon stats */
  async getStats() {
    try {
      const res = await _request(`${this.daemonUrl}/api/stats`, 'GET');
      return res.body;
    } catch (err) {
      return { error: err.message };
    }
  }

  /** @returns {Promise<object>} Daemon health status */
  async health() {
    try {
      const res = await _request(`${this.daemonUrl}/health`, 'GET');
      return res.body;
    } catch (err) {
      return { status: 'unreachable', error: err.message };
    }
  }

  // ── WebSocket live feed ───────────────────────────────────────────────────

  /**
   * Subscribe to the live event stream via WebSocket.
   * Requires the 'ws' package: npm install ws
   *
   * @param {'events'|'stats'|'dashboard'} channel  Which channel to subscribe to
   * @param {function} onMessage  Callback(message: object)
   * @returns {WebSocket} The WebSocket instance (call .close() to stop)
   *
   * @example
   *   const ws = guard.subscribe('dashboard', (msg) => {
   *     if (msg.type === 'event' && msg.data.verdict === 'block') {
   *       console.log('BLOCKED:', msg.data);
   *     }
   *   });
   */
  subscribe(channel = 'dashboard', onMessage) {
    let WS;
    try {
      WS = require('ws');
    } catch {
      throw new Error("WebSocket subscription requires 'ws' package: npm install ws");
    }
    const wsUrl = this.daemonUrl.replace(/^http/, 'ws') + `/ws/${channel}`;
    const ws = new WS(wsUrl);

    ws.on('open',    ()  => { this._log(`WebSocket connected: ${wsUrl}`); });
    ws.on('message', (d) => {
      try { onMessage(JSON.parse(d.toString())); } catch { onMessage(d.toString()); }
    });
    ws.on('error',   (e) => { this._warn(`WebSocket error: ${e.message}`); });
    ws.on('close',   ()  => { this._log('WebSocket disconnected'); });

    // Keep-alive ping
    const ping = setInterval(() => {
      if (ws.readyState === WS.OPEN) {
        ws.send(JSON.stringify({ type: 'ping' }));
      } else {
        clearInterval(ping);
      }
    }, 30_000);

    return ws;
  }

  // ── Internal ──────────────────────────────────────────────────────────────

  _log(msg)  { if (this.verbose) console.log(`[AgentGuard] ${msg}`); }
  _warn(msg) { console.warn(`[AgentGuard] ⚠ ${msg}`); }
}

// ─── Convenience factory ──────────────────────────────────────────────────────

/**
 * One-line integration.
 * Registers the process, sets up proxy, returns the guard instance.
 *
 * @example
 *   const guard = await agentGuard('my-agent', Policy.RESTRICTED);
 *   // That's it — all traffic is now intercepted
 */
async function agentGuard(name, policy = Policy.RESTRICTED, options = {}) {
  const guard = new AgentGuard(options);
  guard.useProxy();
  await guard.register(name, policy);
  return guard;
}

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = { AgentGuard, Policy, PolicyName, agentGuard };

// ESM-compatible default export hint
if (typeof module !== 'undefined') {
  module.exports.default = { AgentGuard, Policy, PolicyName, agentGuard };
}
