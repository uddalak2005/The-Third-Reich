// SPDX-License-Identifier: GPL-2.0
// AgentGuard - AI Agent Request Interception & Policy Enforcement
// eBPF Kernel Program
//
// Architecture:
//   XDP hook  → intercepts inbound packets BEFORE kernel network stack
//   TC egress → intercepts outbound packets (agent API calls, exfil)
//   kprobe    → intercepts dangerous syscalls (exec, fork, ptrace, mmap)
//   All verdicts are: PASS | DROP | REDIRECT (to sandbox) | KILL (agent PID)
//
// WSL/Docker: Load via 'ip link set dev eth0 xdp obj agent_guard.bpf.o sec xdp'
//             TC:  'tc filter add dev eth0 egress bpf da obj agent_guard.bpf.o sec tc/egress'

#include <linux/bpf.h>
#include <linux/if_ether.h>
#include <linux/ip.h>
#include <linux/ipv6.h>
#include <linux/tcp.h>
#include <linux/udp.h>
#include <linux/icmp.h>
#include <linux/in.h>
#include <linux/ptrace.h>
#include <bpf/bpf_helpers.h>
#include <bpf/bpf_endian.h>
#include <bpf/bpf_tracing.h>

// ─── Missing Definitions (for environments without full kernel headers) ───────
#ifndef TC_ACT_OK
#define TC_ACT_OK      0
#endif
#ifndef TC_ACT_SHOT
#define TC_ACT_SHOT    2
#endif

// Structure for tracepoint/raw_syscalls/sys_enter
struct trace_entry {
    short unsigned int type;
    unsigned char flags;
    unsigned char preempt_count;
    int pid;
};

struct trace_event_raw_sys_enter {
    struct trace_entry ent;
    __u64 id;
    __u64 args[6];
};


// ─── Constants ────────────────────────────────────────────────────────────────
#define MAX_AGENTS          1024
#define MAX_POLICIES        256
#define MAX_BLOCKED_IPS     65536
#define MAX_FLOWS           1000000
#define RING_BUFFER_SIZE    4194304   // 4MB ring buffer for high-throughput
#define MAX_HTTP_INSPECT    512       // bytes of HTTP payload to inspect
#define AGENT_COMM_LEN      64        // max agent process name length
#define MAX_EXFIL_PATTERNS  64        // known data exfiltration signature slots
#define TOKEN_BUCKET_MAX    10000     // max burst tokens per agent
#define TOKEN_REFILL_NS     1000000   // refill interval: 1ms

// ─── Verdict codes (returned to TC/XDP) ───────────────────────────────────────
#define VERDICT_ALLOW       0
#define VERDICT_BLOCK       1
#define VERDICT_SANDBOX     2         // redirect to honeypot/sandbox namespace
#define VERDICT_KILL        3         // signal userspace to SIGKILL agent PID
#define VERDICT_AUDIT       4         // allow but emit full audit event

// ─── Agent threat level ────────────────────────────────────────────────────────
#define THREAT_NONE         0
#define THREAT_LOW          1
#define THREAT_MEDIUM       2
#define THREAT_HIGH         3
#define THREAT_CRITICAL     4         // triggers KILL verdict

// ─── Event types ──────────────────────────────────────────────────────────────
#define EVT_PACKET_SEEN         1
#define EVT_POLICY_BLOCK        2
#define EVT_PROMPT_INJECTION    3     // HTTP body contains injection attempt
#define EVT_DATA_EXFIL          4     // suspicious outbound data volume/pattern
#define EVT_DANGEROUS_SYSCALL   5     // exec/fork/ptrace from agent PID
#define EVT_RATE_LIMIT_HIT      6     // token bucket exhausted
#define EVT_SANDBOX_REDIRECT    7
#define EVT_AGENT_KILL          8
#define EVT_TOOL_ABUSE          9     // agent tried disallowed tool call
#define EVT_C2_DETECTED         10    // known C2/malware destination IP

// ─── Syscall numbers (x86_64) ─────────────────────────────────────────────────
#define SYS_execve          59
#define SYS_execveat        322
#define SYS_fork            57
#define SYS_clone           56
#define SYS_ptrace          101
#define SYS_mmap            9
#define SYS_open            2
#define SYS_openat          257
#define SYS_socket          41
#define SYS_connect         42
#define SYS_bind            49
#define SYS_kill            62        // agent trying to kill other procs

// ─── TCP flags ────────────────────────────────────────────────────────────────
#define TCP_FIN  0x01
#define TCP_SYN  0x02
#define TCP_RST  0x04
#define TCP_ACK  0x10

// ─── HTTP method fingerprints (first 4 bytes as u32 for fast comparison) ──────
#define HTTP_GET_SIG    0x47455420   // "GET "
#define HTTP_POST_SIG   0x504F5354   // "POST"
#define HTTP_PUT_SIG    0x50555420   // "PUT "
#define HTTP_PATCH_SIG  0x50415443   // "PATC"
#define HTTP_DELETE_SIG 0x44454C45   // "DELE"

// ─────────────────────────────────────────────────────────────────────────────
// Data structures
// ─────────────────────────────────────────────────────────────────────────────

// Identity of a running AI agent process
struct agent_identity {
    __u32 pid;
    __u32 tgid;
    char  comm[16];           // process comm (truncated name)
    char  full_name[48];      // agent framework name set by userspace
    __u32 policy_id;          // which policy applies to this agent
    __u32 threat_level;       // current assessed threat level
    __u64 first_seen_ns;
    __u64 last_active_ns;
    __u64 requests_total;
    __u64 requests_blocked;
    __u64 bytes_sent;
    __u64 bytes_recv;
    __u32 flags;              // AGENT_FLAG_* below
};

#define AGENT_FLAG_REGISTERED   (1 << 0)  // explicitly enrolled by operator
#define AGENT_FLAG_SANDBOXED    (1 << 1)  // all traffic redirected to sandbox
#define AGENT_FLAG_KILLED       (1 << 2)  // userspace was asked to kill this
#define AGENT_FLAG_AUDITING     (1 << 3)  // full audit mode (log everything)

// Policy definition (loaded from userspace policy YAML → BPF map)
struct agent_policy {
    __u32  policy_id;
    __u32  allowed_ports[16];     // whitelist of dest ports; 0 = end of list
    __u32  blocked_ips[8];        // explicit IP blocklist (C2, etc.)
    __u64  max_bytes_per_sec;     // outbound bandwidth cap
    __u32  max_connections;       // max concurrent connections
    __u32  max_new_conns_per_sec; // rate limit: new TCP SYNs per second
    __u8   allow_exec;            // may agent spawn child processes?
    __u8   allow_fork;
    __u8   allow_ptrace;          // ptrace = almost always malicious for agents
    __u8   allow_raw_sockets;
    __u8   allow_bind;            // may agent bind listening ports?
    __u8   inspect_http;          // perform HTTP payload inspection?
    __u8   block_on_injection;    // drop packet if injection pattern found?
    __u8   allow_external_net;    // may agent reach internet (vs internal only)?
    __u32  sandbox_ns_id;         // network namespace ID for redirect
};

// Flow tracking key (5-tuple)
struct flow_key {
    __u32 src_ip;
    __u32 dst_ip;
    __u16 src_port;
    __u16 dst_port;
    __u8  protocol;
    __u32 agent_pid;          // owning agent PID (set by TC from skb->sk)
    __u8  _pad[3];
};

// Per-flow state
struct flow_state {
    __u64 packets;
    __u64 bytes;
    __u64 first_seen_ns;
    __u64 last_seen_ns;
    __u32 tcp_flags_seen;
    __u32 verdict;            // last verdict applied
    __u32 agent_pid;
    __u32 exfil_score;        // running exfiltration risk score
};

// Token bucket for per-agent rate limiting
struct token_bucket {
    __u64 tokens;             // current token count (fixed-point × 1000)
    __u64 last_refill_ns;
    __u64 max_tokens;
    __u64 refill_rate;        // tokens per nanosecond × 1000
    __u32 drops;              // total drops due to rate limiting
};

// ─────────────────────────────────────────────────────────────────────────────
// Event structures (sent to userspace via ring buffer)
// ─────────────────────────────────────────────────────────────────────────────

// Core agent event (all event types share this header)
struct agent_event {
    __u64 timestamp_ns;
    __u32 event_type;
    __u32 pid;
    __u32 tgid;
    char  comm[16];
    // Network context
    __u32 src_ip;
    __u32 dst_ip;
    __u16 src_port;
    __u16 dst_port;
    __u8  protocol;
    __u32 packet_size;
    __u32 tcp_flags;
    // Verdict context
    __u32 verdict;
    __u32 policy_id;
    __u32 threat_level;
    // Payload fingerprint (first 64 bytes of TCP payload, for HTTP inspection)
    __u8  payload_head[64];
    __u32 payload_len;
    // Extra metadata (meaning depends on event_type)
    __u32 meta[8];
};

// Syscall intercept event (from kprobe/tracepoint hooks)
struct syscall_event {
    __u64 timestamp_ns;
    __u32 event_type;
    __u32 pid;
    __u32 tgid;
    char  comm[16];
    __u32 syscall_nr;
    __u64 args[4];            // first 4 syscall arguments
    __u32 verdict;
    __u32 threat_level;
};

// ─────────────────────────────────────────────────────────────────────────────
// BPF Maps
// ─────────────────────────────────────────────────────────────────────────────

// Agent registry: PID → identity + policy
struct {
    __uint(type, BPF_MAP_TYPE_LRU_HASH);
    __uint(max_entries, MAX_AGENTS);
    __type(key, __u32);                   // key: PID
    __type(value, struct agent_identity);
} agent_registry SEC(".maps");

// Policy store: policy_id → policy rules
struct {
    __uint(type, BPF_MAP_TYPE_ARRAY);
    __uint(max_entries, MAX_POLICIES);
    __type(key, __u32);
    __type(value, struct agent_policy);
} policy_store SEC(".maps");

// Global blocked IP set (C2, malware, threat intel feeds)
struct {
    __uint(type, BPF_MAP_TYPE_LRU_HASH);
    __uint(max_entries, MAX_BLOCKED_IPS);
    __type(key, __u32);                   // key: dst IP (network byte order)
    __type(value, __u32);                 // value: block reason code
} blocked_ips SEC(".maps");

// Active flow table
struct {
    __uint(type, BPF_MAP_TYPE_LRU_HASH);
    __uint(max_entries, MAX_FLOWS);
    __type(key, struct flow_key);
    __type(value, struct flow_state);
} flow_table SEC(".maps");

// Per-agent token buckets for rate limiting
struct {
    __uint(type, BPF_MAP_TYPE_LRU_HASH);
    __uint(max_entries, MAX_AGENTS);
    __type(key, __u32);                   // key: agent PID
    __type(value, struct token_bucket);
} token_buckets SEC(".maps");

// Agent event ring buffer (to userspace policy daemon)
struct {
    __uint(type, BPF_MAP_TYPE_RINGBUF);
    __uint(max_entries, RING_BUFFER_SIZE);
} agent_events SEC(".maps");

// Syscall event ring buffer
struct {
    __uint(type, BPF_MAP_TYPE_RINGBUF);
    __uint(max_entries, RING_BUFFER_SIZE);
} syscall_events SEC(".maps");

// Per-CPU statistics
struct {
    __uint(type, BPF_MAP_TYPE_PERCPU_ARRAY);
    __uint(max_entries, 32);
    __type(key, __u32);
    __type(value, __u64);
} global_stats SEC(".maps");

// Global config (sampling, thresholds, feature flags)
struct {
    __uint(type, BPF_MAP_TYPE_ARRAY);
    __uint(max_entries, 32);
    __type(key, __u32);
    __type(value, __u64);
} guard_config SEC(".maps");

// Verdict override map: userspace can set per-PID verdicts
// (used for manual block/allow/sandbox commands)
struct {
    __uint(type, BPF_MAP_TYPE_LRU_HASH);
    __uint(max_entries, MAX_AGENTS);
    __type(key, __u32);                   // key: PID
    __type(value, __u32);                 // value: forced VERDICT_*
} verdict_overrides SEC(".maps");

// ─── Stat indices ─────────────────────────────────────────────────────────────
#define STAT_PKTS_SEEN          0
#define STAT_PKTS_BLOCKED       1
#define STAT_PKTS_PASSED        2
#define STAT_BYTES_IN           3
#define STAT_BYTES_OUT          4
#define STAT_AGENTS_SEEN        5
#define STAT_POLICY_HITS        6
#define STAT_INJECTIONS_FOUND   7
#define STAT_EXFIL_BLOCKED      8
#define STAT_SYSCALLS_BLOCKED   9
#define STAT_RATE_LIMIT_DROPS   10
#define STAT_SANDBOX_REDIRECTS  11

// ─── Config indices ───────────────────────────────────────────────────────────
#define CFG_ENABLED             0     // master kill switch
#define CFG_DEFAULT_POLICY      1     // policy_id for unknown PIDs
#define CFG_SAMPLING_RATE       2     // 1-of-N packet sampling for events
#define CFG_HTTP_INSPECT        3     // global HTTP inspection toggle
#define CFG_EXFIL_THRESHOLD     4     // bytes-per-sec triggering exfil alert
#define CFG_SANDBOX_IP          5     // sandbox netns redirect destination IP

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

static __always_inline void stat_inc(__u32 idx) {
    __u64 *v = bpf_map_lookup_elem(&global_stats, &idx);
    if (v) __sync_fetch_and_add(v, 1);
}

static __always_inline void stat_add(__u32 idx, __u64 n) {
    __u64 *v = bpf_map_lookup_elem(&global_stats, &idx);
    if (v) __sync_fetch_and_add(v, n);
}

static __always_inline __u64 cfg_get(__u32 idx, __u64 def) {
    __u64 *v = bpf_map_lookup_elem(&guard_config, &idx);
    return v ? *v : def;
}

// Check if a destination IP is in the global blocklist
static __always_inline int is_blocked_ip(__u32 ip) {
    __u32 *reason = bpf_map_lookup_elem(&blocked_ips, &ip);
    return reason != NULL;
}

// Resolve agent identity for current PID (or default policy for unknown agents)
static __always_inline struct agent_identity *get_agent(__u32 pid) {
    return bpf_map_lookup_elem(&agent_registry, &pid);
}

// Get policy for a given policy_id
static __always_inline struct agent_policy *get_policy(__u32 policy_id) {
    return bpf_map_lookup_elem(&policy_store, &policy_id);
}

// Check if a port is in the policy whitelist (returns 1 if allowed)
static __always_inline int port_allowed(struct agent_policy *pol, __u16 dst_port) {
    // if whitelist is empty (all zeros), allow all ports
    if (pol->allowed_ports[0] == 0) return 1;

    #pragma unroll
    for (int i = 0; i < 16; i++) {
        if (pol->allowed_ports[i] == 0) break;
        if ((__u16)pol->allowed_ports[i] == dst_port) return 1;
    }
    return 0;
}

// Token bucket consume: returns 1 if allowed, 0 if rate limited
static __always_inline int token_bucket_consume(__u32 pid, __u64 now_ns,
                                                 __u64 cost, __u64 max_rate) {
    struct token_bucket *bucket = bpf_map_lookup_elem(&token_buckets, &pid);
    if (!bucket) {
        struct token_bucket new_bucket = {
            .tokens       = TOKEN_BUCKET_MAX * 1000,
            .last_refill_ns = now_ns,
            .max_tokens   = TOKEN_BUCKET_MAX * 1000,
            .refill_rate  = max_rate,
        };
        bpf_map_update_elem(&token_buckets, &pid, &new_bucket, BPF_ANY);
        return 1;
    }

    // Refill based on elapsed time
    __u64 elapsed = now_ns - bucket->last_refill_ns;
    if (elapsed > 0) {
        __u64 refill = elapsed * bucket->refill_rate;
        bucket->tokens += refill;
        if (bucket->tokens > bucket->max_tokens)
            bucket->tokens = bucket->max_tokens;
        bucket->last_refill_ns = now_ns;
    }

    if (bucket->tokens < cost * 1000) {
        __sync_fetch_and_add(&bucket->drops, 1);
        return 0;
    }
    bucket->tokens -= cost * 1000;
    return 1;
}

// Emit an agent event to the ring buffer
static __always_inline void emit_event(struct agent_event *evt) {
    struct agent_event *out =
        bpf_ringbuf_reserve(&agent_events, sizeof(*out), 0);
    if (!out) return;
    __builtin_memcpy(out, evt, sizeof(*out));
    bpf_ringbuf_submit(out, 0);
}

// ─────────────────────────────────────────────────────────────────────────────
// HTTP payload inspection
//
// We grab the first MAX_HTTP_INSPECT bytes of TCP payload and look for:
//   1. Prompt injection markers (common LLM attack patterns)
//   2. Sensitive data patterns (API keys, tokens)
//   3. Unexpected HTTP destinations
//
// This runs entirely in BPF — no copy to userspace until we have a hit.
// ─────────────────────────────────────────────────────────────────────────────

// Simple case-insensitive 4-byte pattern match helper
static __always_inline int match4(const __u8 *buf, __u8 a, __u8 b, __u8 c, __u8 d) {
    return (buf[0] == a || buf[0] == a + 32) &&
           (buf[1] == b || buf[1] == b + 32) &&
           (buf[2] == c || buf[2] == c + 32) &&
           (buf[3] == d || buf[3] == d + 32);
}

// Returns injection risk score (0 = clean, >0 = suspicious)
// Checks for common prompt injection / jailbreak markers in HTTP bodies
static __always_inline __u32 inspect_http_payload(void *payload_start,
                                                    void *data_end) {
    __u32 score = 0;
    __u8 buf[64];
    
    // Boundary check for the start of the payload
    if (payload_start >= data_end) return 0;
    
    // Safely read the first 64 bytes into a stack buffer for inspection
    // This makes the verifier much happier as we then only access stack memory.
    if (bpf_probe_read_kernel(buf, sizeof(buf), payload_start) < 0)
        return 0;

    // ── Pattern group 1: prompt injection markers ──────────────────────────
    // "ignore" — "ignore previous instructions"
    if (match4(buf, 'I','G','N','O') &&
        (buf[4] == 'R' || buf[4] == 'r') &&
        (buf[5] == 'E' || buf[5] == 'e'))
        score += 40;

    // "jailbreak" / "DAN" pattern
    if ((buf[0] == 'D' || buf[0] == 'd') &&
        (buf[1] == 'A' || buf[1] == 'a') &&
        (buf[2] == 'N' || buf[2] == 'n'))
        score += 30;

    // "<|system|>"
    if (buf[0] == '<' && buf[1] == '|' &&
        (buf[2] == 's' || buf[2] == 'S') &&
        (buf[3] == 'y' || buf[3] == 'Y'))
        score += 50;

    // "SYSTEM:" 
    if (match4(buf, 'S','Y','S','T') &&
        (buf[4] == 'E' || buf[4] == 'e') &&
        (buf[5] == 'M' || buf[5] == 'm') &&
        buf[6] == ':')
        score += 35;

    // "[INST]"
    if (buf[0] == '[' &&
        (buf[1] == 'I' || buf[1] == 'i') &&
        (buf[2] == 'N' || buf[2] == 'n') &&
        (buf[3] == 'S' || buf[3] == 's') &&
        (buf[4] == 'T' || buf[4] == 't') &&
        buf[5] == ']')
        score += 45;

    // ── Pattern group 2: credential / token exfiltration patterns ──────────
    if (match4(buf, 'B','E','A','R') &&
        (buf[4] == 'E' || buf[4] == 'e') &&
        (buf[5] == 'R' || buf[5] == 'r') &&
        buf[6] == ' ')
        score += 25;

    if (buf[0] == 's' && buf[1] == 'k' && buf[2] == '-')
        score += 35;

    if (buf[0] == 'g' && buf[1] == 'h' && buf[2] == 'p' && buf[3] == '_')
        score += 40;

    if ((buf[0] == 'A' || buf[0] == 'a') &&
        (buf[1] == 'K' || buf[1] == 'k') &&
        (buf[2] == 'I' || buf[2] == 'i') &&
        (buf[3] == 'A' || buf[3] == 'a'))
        score += 40;

    return score;
}

// ─────────────────────────────────────────────────────────────────────────────
// Core packet processing (shared by XDP + TC)
// ─────────────────────────────────────────────────────────────────────────────

static __always_inline int process_packet(
    void *data, void *data_end,
    __u32 ingress,            // 1=inbound XDP, 0=outbound TC
    int *out_verdict)
{
    *out_verdict = VERDICT_ALLOW;

    if (!cfg_get(CFG_ENABLED, 1)) return 0;

    // ── Parse Ethernet header ──────────────────────────────────────────────
    struct ethhdr *eth = data;
    if ((void *)(eth + 1) > data_end) return -1;
    if (eth->h_proto != bpf_htons(ETH_P_IP)) return -1;  // IPv4 only for now

    // ── Parse IP header ────────────────────────────────────────────────────
    struct iphdr *ip = (void *)(eth + 1);
    if ((void *)(ip + 1) > data_end) return -1;

    __u32 src_ip  = ip->saddr;
    __u32 dst_ip  = ip->daddr;
    __u32 pkt_len = bpf_ntohs(ip->tot_len);
    __u8  proto   = ip->protocol;
    void *l4      = (void *)ip + (ip->ihl * 4);

    // ── Parse L4 headers ───────────────────────────────────────────────────
    __u16 src_port = 0, dst_port = 0;
    __u32 tcp_flags = 0;
    void *payload   = NULL;

    if (proto == IPPROTO_TCP) {
        struct tcphdr *tcp = l4;
        if ((void *)(tcp + 1) > data_end) return -1;
        src_port  = bpf_ntohs(tcp->source);
        dst_port  = bpf_ntohs(tcp->dest);
        tcp_flags = (tcp->fin) | (tcp->syn << 1) | (tcp->rst << 2) | (tcp->ack << 4);
        if ((void *)tcp + (tcp->doff * 4) > data_end) return -1;
        payload   = (void *)tcp + (tcp->doff * 4);
    } else if (proto == IPPROTO_UDP) {
        struct udphdr *udp = l4;
        if ((void *)(udp + 1) > data_end) return -1;
        src_port = bpf_ntohs(udp->source);
        dst_port = bpf_ntohs(udp->dest);
        payload  = (void *)(udp + 1);
    }

    // ── Resolve agent PID ──────────────────────────────────────────────────
    // On egress (TC), we can get PID from the socket owner.
    // On ingress (XDP), we use connection tracking to map back to the agent.
    __u32 pid  = (__u32)(bpf_get_current_pid_tgid() >> 32);
    __u32 tgid = (__u32)(bpf_get_current_pid_tgid() & 0xFFFFFFFF);
    char  comm[16];
    bpf_get_current_comm(comm, sizeof(comm));

    // ── Check verdict overrides (manual block/allow by operator) ──────────
    __u32 *forced = bpf_map_lookup_elem(&verdict_overrides, &pid);
    if (forced) {
        *out_verdict = *forced;
        stat_inc(STAT_POLICY_HITS);
        goto emit_and_return;
    }

    // ── Global IP blocklist check ──────────────────────────────────────────
    __u32 check_ip = ingress ? src_ip : dst_ip;
    if (is_blocked_ip(check_ip)) {
        *out_verdict = VERDICT_BLOCK;
        stat_inc(STAT_PKTS_BLOCKED);
        stat_inc(STAT_POLICY_HITS);
        goto emit_and_return;
    }

    // ── Agent lookup & policy enforcement ─────────────────────────────────
    struct agent_identity *agent = get_agent(pid);
    if (agent) {
        // Update activity stats
        agent->last_active_ns = bpf_ktime_get_ns();
        if (ingress)
            __sync_fetch_and_add(&agent->bytes_recv, pkt_len);
        else
            __sync_fetch_and_add(&agent->bytes_sent, pkt_len);
        __sync_fetch_and_add(&agent->requests_total, 1);

        // Inherit forced sandbox/kill state
        if (agent->flags & AGENT_FLAG_KILLED) {
            *out_verdict = VERDICT_KILL;
            goto emit_and_return;
        }
        if (agent->flags & AGENT_FLAG_SANDBOXED) {
            *out_verdict = VERDICT_SANDBOX;
            stat_inc(STAT_SANDBOX_REDIRECTS);
            goto emit_and_return;
        }

        // Load this agent's policy
        struct agent_policy *pol = get_policy(agent->policy_id);
        if (pol) {
            // ── Port whitelist check (egress only) ─────────────────────
            if (!ingress && proto == IPPROTO_TCP) {
                if (!port_allowed(pol, dst_port)) {
                    *out_verdict = VERDICT_BLOCK;
                    __sync_fetch_and_add(&agent->requests_blocked, 1);
                    stat_inc(STAT_PKTS_BLOCKED);
                    goto emit_and_return;
                }
            }

            // ── External network restriction ───────────────────────────
            // Block any packet to non-RFC1918 addresses if external net disabled
            if (!ingress && !pol->allow_external_net) {
                __u32 d = bpf_ntohl(dst_ip);
                // Allow only RFC1918: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16
                int is_private =
                    ((d & 0xFF000000) == 0x0A000000) ||
                    ((d & 0xFFF00000) == 0xAC100000) ||
                    ((d & 0xFFFF0000) == 0xC0A80000);
                if (!is_private) {
                    *out_verdict = VERDICT_BLOCK;
                    __sync_fetch_and_add(&agent->requests_blocked, 1);
                    stat_inc(STAT_PKTS_BLOCKED);
                    goto emit_and_return;
                }
            }

            // ── Rate limiting (token bucket) ───────────────────────────
            __u64 now_ns = bpf_ktime_get_ns();
            if (!token_bucket_consume(pid, now_ns, pkt_len,
                                      pol->max_bytes_per_sec / 1000000000ULL)) {
                *out_verdict = VERDICT_BLOCK;
                stat_inc(STAT_RATE_LIMIT_DROPS);
                goto emit_and_return;
            }

            // ── HTTP payload inspection ────────────────────────────────
            if (pol->inspect_http && payload && proto == IPPROTO_TCP &&
                (dst_port == 80 || dst_port == 443 || dst_port == 8080 ||
                 dst_port == 8443 || src_port == 80 || src_port == 443)) {

                struct agent_event *evt =
                    bpf_ringbuf_reserve(&agent_events, sizeof(*evt), 0);
                if (evt) {
                    evt->timestamp_ns = now_ns;
                    evt->event_type   = EVT_PACKET_SEEN;
                    evt->pid          = pid;
                    evt->tgid         = tgid;
                    __builtin_memcpy(evt->comm, comm, 16);
                    evt->src_ip       = src_ip;
                    evt->dst_ip       = dst_ip;
                    evt->src_port     = src_port;
                    evt->dst_port     = dst_port;
                    evt->protocol     = proto;
                    evt->packet_size  = pkt_len;
                    evt->tcp_flags    = tcp_flags;
                    evt->policy_id    = agent->policy_id;
                    evt->threat_level = agent->threat_level;

                    __u32 injection_score =
                        inspect_http_payload(payload, data_end);
                    if (injection_score > 0) {
                        bpf_probe_read_kernel(evt->payload_head, 64, payload);
                    }
                    evt->payload_len = injection_score; // re-used as score
                    evt->meta[0]     = injection_score;

                    if (injection_score > 0) {
                        evt->event_type = EVT_PROMPT_INJECTION;
                        stat_inc(STAT_INJECTIONS_FOUND);
                        if (pol->block_on_injection) {
                            evt->verdict    = VERDICT_BLOCK;
                            *out_verdict    = VERDICT_BLOCK;
                            __sync_fetch_and_add(&agent->requests_blocked, 1);
                            bpf_ringbuf_submit(evt, 0);
                            goto blocked;
                        }
                    }

                    evt->verdict = *out_verdict;
                    bpf_ringbuf_submit(evt, 0);
                }
            }
        }
    }

    // ── Update flow table ──────────────────────────────────────────────────
    struct flow_key fk = {
        .src_ip   = src_ip,
        .dst_ip   = dst_ip,
        .src_port = src_port,
        .dst_port = dst_port,
        .protocol = proto,
        .agent_pid = pid,
    };
    struct flow_state *fs = bpf_map_lookup_elem(&flow_table, &fk);
    if (!fs) {
        struct flow_state new_fs = {
            .packets      = 1,
            .bytes        = pkt_len,
            .first_seen_ns= bpf_ktime_get_ns(),
            .last_seen_ns = bpf_ktime_get_ns(),
            .tcp_flags_seen = tcp_flags,
            .verdict      = *out_verdict,
            .agent_pid    = pid,
        };
        bpf_map_update_elem(&flow_table, &fk, &new_fs, BPF_ANY);
    } else {
        __sync_fetch_and_add(&fs->packets, 1);
        __sync_fetch_and_add(&fs->bytes, pkt_len);
        fs->last_seen_ns = bpf_ktime_get_ns();
        fs->tcp_flags_seen |= tcp_flags;
        fs->verdict = *out_verdict;
    }

    stat_inc(ingress ? STAT_BYTES_IN : STAT_BYTES_OUT);
    stat_inc(STAT_PKTS_PASSED);
    return 0;

emit_and_return:
    // Emit lightweight event to ring buffer for audit trail
    {
        struct agent_event *evt =
            bpf_ringbuf_reserve(&agent_events, sizeof(*evt), 0);
        if (evt) {
            evt->timestamp_ns = bpf_ktime_get_ns();
            evt->event_type   = (*out_verdict == VERDICT_ALLOW) ?
                                 EVT_PACKET_SEEN : EVT_POLICY_BLOCK;
            evt->pid          = pid;
            evt->tgid         = tgid;
            __builtin_memcpy(evt->comm, comm, 16);
            evt->src_ip       = src_ip;
            evt->dst_ip       = dst_ip;
            evt->src_port     = src_port;
            evt->dst_port     = dst_port;
            evt->protocol     = proto;
            evt->packet_size  = pkt_len;
            evt->tcp_flags    = tcp_flags;
            evt->verdict      = *out_verdict;
            bpf_ringbuf_submit(evt, 0);
        }
    }
    return 0;

blocked:
    stat_inc(STAT_PKTS_BLOCKED);
    return 1;  // tell caller: DROP this packet
}

// ─────────────────────────────────────────────────────────────────────────────
// XDP program — inbound packet interception (pre-kernel, wire speed)
// Attach: ip link set dev <iface> xdp obj agent_guard.bpf.o sec xdp/ingress
// ─────────────────────────────────────────────────────────────────────────────
SEC("xdp/ingress")
int agent_guard_xdp(struct xdp_md *ctx) {
    void *data     = (void *)(long)ctx->data;
    void *data_end = (void *)(long)ctx->data_end;

    int verdict = VERDICT_ALLOW;
    int ret = process_packet(data, data_end, 1, &verdict);
    (void)ret;

    switch (verdict) {
    case VERDICT_BLOCK:
        return XDP_DROP;
    case VERDICT_SANDBOX:
        // XDP_REDIRECT to sandbox network namespace
        // Sandbox target ifindex set via verdict_overrides or config map
        // For simplicity: userspace handles redirect after seeing ring buffer event
        return XDP_DROP;
    default:
        return XDP_PASS;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// TC egress program — outbound packet interception
// Critical for catching: API calls, data exfiltration, C2 callbacks
// Attach: tc filter add dev <iface> egress bpf da obj agent_guard.bpf.o sec tc/egress
// ─────────────────────────────────────────────────────────────────────────────
SEC("tc/egress")
int agent_guard_tc_egress(struct __sk_buff *skb) {
    void *data     = (void *)(long)skb->data;
    void *data_end = (void *)(long)skb->data_end;

    int verdict = VERDICT_ALLOW;
    int ret = process_packet(data, data_end, 0, &verdict);
    (void)ret;

    switch (verdict) {
    case VERDICT_BLOCK:
    case VERDICT_KILL:
        stat_inc(STAT_PKTS_BLOCKED);
        return TC_ACT_SHOT;     // drop packet silently
    case VERDICT_SANDBOX:
        stat_inc(STAT_SANDBOX_REDIRECTS);
        // TC_ACT_REDIRECT to sandbox ifindex (set via skb_redirect)
        // userspace handles ns plumbing; BPF just drops here as fallback
        return TC_ACT_SHOT;
    case VERDICT_AUDIT:
        // Pass but ensure event was emitted (already done in process_packet)
        return TC_ACT_OK;
    default:
        return TC_ACT_OK;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// TC ingress program — inbound packet interception via tc clsact
// Attach: tc filter add dev <iface> ingress bpf da obj agent_guard.bpf.o sec tc/ingress
// ─────────────────────────────────────────────────────────────────────────────
SEC("tc/ingress")
int agent_guard_tc_ingress(struct __sk_buff *skb) {
    void *data     = (void *)(long)skb->data;
    void *data_end = (void *)(long)skb->data_end;

    int verdict = VERDICT_ALLOW;
    process_packet(data, data_end, 1, &verdict);

    return (verdict == VERDICT_BLOCK) ? TC_ACT_SHOT : TC_ACT_OK;
}

// ─────────────────────────────────────────────────────────────────────────────
// kprobe: intercept dangerous syscalls from agent processes
//
// We attach to raw_syscalls/sys_enter tracepoint to get all syscalls
// and filter by PID matching a known agent in our registry.
//
// This covers: exec (agent spawning shells), fork (process escape),
//              ptrace (agent trying to inspect/hijack other processes),
//              raw socket creation (bypass firewall), kill (agent killing system)
// ─────────────────────────────────────────────────────────────────────────────
SEC("tracepoint/raw_syscalls/sys_enter")
int agent_guard_syscall(struct trace_event_raw_sys_enter *ctx) {
    __u32 pid  = (__u32)(bpf_get_current_pid_tgid() >> 32);
    __u32 tgid = (__u32)(bpf_get_current_pid_tgid() & 0xFFFFFFFF);
    __u64 syscall_nr = ctx->id;

    // Fast path: is this PID a registered agent?
    struct agent_identity *agent = get_agent(pid);
    if (!agent) return 0;  // not an agent we track, skip

    // Load policy for this agent
    struct agent_policy *pol = get_policy(agent->policy_id);
    if (!pol) return 0;

    int blocked = 0;
    __u32 threat_delta = 0;

    switch (syscall_nr) {
    case SYS_execve:
    case SYS_execveat:
        // Agent spawning a new process — potential shell escape
        if (!pol->allow_exec) {
            blocked = 1;
            threat_delta = 3;  // serious: escalate threat level
        }
        break;

    case SYS_fork:
    case SYS_clone:
        if (!pol->allow_fork) {
            blocked = 1;
            threat_delta = 2;
        }
        break;

    case SYS_ptrace:
        // ptrace from an AI agent is almost always a privilege escalation attempt
        if (!pol->allow_ptrace) {
            blocked = 1;
            threat_delta = 4;  // critical: instant threat escalation
        }
        break;

    case SYS_socket:
        // Check if trying to create a raw/packet socket (firewall bypass)
        {
            int sock_type = (int)ctx->args[1];
            if (!pol->allow_raw_sockets &&
                (sock_type == 3 /* SOCK_RAW */ || sock_type == 10 /* SOCK_PACKET */)) {
                blocked = 1;
                threat_delta = 3;
            }
        }
        break;

    case SYS_bind:
        if (!pol->allow_bind) {
            blocked = 1;
            threat_delta = 1;
        }
        break;

    case SYS_kill:
        // Agent sending signals to other processes
        {
            __u32 target_pid = (int)ctx->args[0];
            int   signum     = (int)ctx->args[1];
            // Allow SIGTERM/SIGCHLD to own process group, block everything else
            if (target_pid != pid && signum != 17 /* SIGCHLD */) {
                blocked = 1;
                threat_delta = 3;
            }
        }
        break;

    default:
        return 0;  // unmonitored syscall, pass
    }

    if (threat_delta > 0) {
        __u32 new_threat = agent->threat_level + threat_delta;
        if (new_threat > THREAT_CRITICAL) new_threat = THREAT_CRITICAL;
        agent->threat_level = new_threat;

        // If agent hits critical threat → mark for kill
        if (new_threat >= THREAT_CRITICAL) {
            agent->flags |= AGENT_FLAG_KILLED;
        }
    }

    // Emit syscall event (regardless of block, for audit)
    struct syscall_event *evt =
        bpf_ringbuf_reserve(&syscall_events, sizeof(*evt), 0);
    if (evt) {
        evt->timestamp_ns = bpf_ktime_get_ns();
        evt->event_type   = blocked ? EVT_DANGEROUS_SYSCALL : EVT_PACKET_SEEN;
        evt->pid          = pid;
        evt->tgid         = tgid;
        bpf_get_current_comm(evt->comm, sizeof(evt->comm));
        evt->syscall_nr   = (__u32)syscall_nr;
        evt->args[0]      = ctx->args[0];
        evt->args[1]      = ctx->args[1];
        evt->args[2]      = ctx->args[2];
        evt->args[3]      = ctx->args[3];
        evt->verdict      = blocked ? VERDICT_BLOCK : VERDICT_ALLOW;
        evt->threat_level = agent->threat_level;
        bpf_ringbuf_submit(evt, 0);
        stat_inc(STAT_SYSCALLS_BLOCKED);
    }

    // NOTE: We cannot block a syscall directly from a tracepoint.
    // The userspace daemon reads the syscall_events ring buffer and
    // issues SIGKILL / seccomp injection as the enforcement action.
    // For true in-kernel syscall blocking, load a seccomp BPF filter
    // via the policy daemon after seeing this event.

    return 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// kprobe on connect(2): catch agent dialing out BEFORE the TCP SYN
// is sent — this gives us the earliest possible egress intercept point.
// ─────────────────────────────────────────────────────────────────────────────
SEC("kprobe/sys_connect")
int agent_guard_connect(struct pt_regs *ctx) {
    __u32 pid = (__u32)(bpf_get_current_pid_tgid() >> 32);

    struct agent_identity *agent = get_agent(pid);
    if (!agent) return 0;

    // The connect() addr argument is a pointer to sockaddr
    // We only do lightweight PID tracking here; full address inspection
    // happens in TC egress when the actual SYN packet is sent.
    agent->last_active_ns = bpf_ktime_get_ns();
    __sync_fetch_and_add(&agent->requests_total, 1);
    stat_inc(STAT_PKTS_SEEN);

    return 0;
}

char _license[] SEC("license") = "GPL";
