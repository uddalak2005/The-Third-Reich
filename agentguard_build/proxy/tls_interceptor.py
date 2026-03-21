"""
AgentGuard TLS Interceptor
Intercepts HTTPS CONNECT tunnels for plaintext inspection.
Uses a local CA to dynamically sign certificates for intercepted hosts.
"""

import io
import os
import ssl
import socket
import threading
import ipaddress
import datetime
from pathlib import Path
from typing import Optional, Tuple

from cryptography import x509
from cryptography.x509.oid import NameOID
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.backends import default_backend

import structlog
log = structlog.get_logger()

# --- Cert Storage ---

CERT_DIR = Path(os.environ.get("AGENTGUARD_CERT_DIR", "/app/certs"))
CA_KEY_PATH  = CERT_DIR / "agentguard-ca.key"
CA_CERT_PATH = CERT_DIR / "agentguard-ca.crt"

# Cache signed certs in memory — one per hostname
_cert_cache: dict = {}
_cert_lock = threading.Lock()


# --- CA Generation ---

def ensure_ca() -> Tuple[object, object]:
    """
    Load or generate the AgentGuard root CA.
    Returns (ca_key, ca_cert).
    Generated once at startup, persisted to CERT_DIR.
    """
    CERT_DIR.mkdir(parents=True, exist_ok=True)

    if CA_KEY_PATH.exists() and CA_CERT_PATH.exists():
        ca_key = serialization.load_pem_private_key(
            CA_KEY_PATH.read_bytes(), password=None)
        ca_cert = x509.load_pem_x509_certificate(CA_CERT_PATH.read_bytes())
        log.info("tls_ca_loaded", path=str(CA_CERT_PATH))
        return ca_key, ca_cert

    # Generate new CA
    ca_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
        backend=default_backend(),
    )
    subject = issuer = x509.Name([
        x509.NameAttribute(NameOID.COMMON_NAME,         "AgentGuard CA"),
        x509.NameAttribute(NameOID.ORGANIZATION_NAME,   "AgentGuard"),
        x509.NameAttribute(NameOID.COUNTRY_NAME,        "US"),
    ])
    ca_pub = ca_key.public_key()
    ca_cert = (
        x509.CertificateBuilder()
        .subject_name(subject)
        .issuer_name(issuer)
        .public_key(ca_pub)
        .serial_number(x509.random_serial_number())
        .not_valid_before(datetime.datetime.utcnow())
        .not_valid_after(datetime.datetime.utcnow() + datetime.timedelta(days=3650))
        .add_extension(x509.BasicConstraints(ca=True, path_length=None), critical=True)
        .add_extension(x509.KeyUsage(
            digital_signature=True, key_cert_sign=True, crl_sign=True,
            content_commitment=False, key_encipherment=False,
            data_encipherment=False, key_agreement=False,
            encipher_only=False, decipher_only=False,
        ), critical=True)
        .add_extension(
            x509.SubjectKeyIdentifier.from_public_key(ca_pub),
            critical=False)
        .add_extension(
            x509.AuthorityKeyIdentifier.from_issuer_public_key(ca_pub),
            critical=False)
        .sign(ca_key, hashes.SHA256(), default_backend())
    )

    CA_KEY_PATH.write_bytes(ca_key.private_bytes(
        serialization.Encoding.PEM,
        serialization.PrivateFormat.TraditionalOpenSSL,
        serialization.NoEncryption(),
    ))
    CA_CERT_PATH.write_bytes(ca_cert.public_bytes(serialization.Encoding.PEM))

    log.info("tls_ca_generated",
             path=str(CA_CERT_PATH),
             tip="Copy this cert to your agent machine and trust it")
    return ca_key, ca_cert


def generate_host_cert(hostname: str, ca_key, ca_cert) -> Tuple[bytes, bytes]:
    """
    Dynamically generate a cert for `hostname` signed by our CA.
    Returns (cert_pem, key_pem).
    Cached in memory after first generation.
    """
    with _cert_lock:
        if hostname in _cert_cache:
            return _cert_cache[hostname]

    host_key = rsa.generate_private_key(
        public_exponent=65537, key_size=2048, backend=default_backend())

    subject = x509.Name([
        x509.NameAttribute(NameOID.COMMON_NAME, hostname),
    ])

    # SAN — required by modern TLS clients
    try:
        san = x509.SubjectAlternativeName(
            [x509.IPAddress(ipaddress.IPv4Address(hostname))])
    except ValueError:
        san = x509.SubjectAlternativeName([x509.DNSName(hostname)])

    host_pub = host_key.public_key()
    cert = (
        x509.CertificateBuilder()
        .subject_name(subject)
        .issuer_name(ca_cert.subject)
        .public_key(host_pub)
        .serial_number(x509.random_serial_number())
        .not_valid_before(datetime.datetime.utcnow())
        .not_valid_after(datetime.datetime.utcnow() + datetime.timedelta(days=365))
        .add_extension(san, critical=False)
        .add_extension(
            x509.SubjectKeyIdentifier.from_public_key(host_pub),
            critical=False)
        .add_extension(
            x509.AuthorityKeyIdentifier.from_issuer_public_key(ca_cert.public_key()),
            critical=False)
        .sign(ca_key, hashes.SHA256(), default_backend())
    )

    cert_pem = cert.public_bytes(serialization.Encoding.PEM)
    key_pem  = host_key.private_bytes(
        serialization.Encoding.PEM,
        serialization.PrivateFormat.TraditionalOpenSSL,
        serialization.NoEncryption(),
    )

    with _cert_lock:
        _cert_cache[hostname] = (cert_pem, key_pem)

    return cert_pem, key_pem


# --- TLS Context Helpers ---

def make_server_ctx(hostname: str, ca_key, ca_cert) -> ssl.SSLContext:
    """
    SSLContext to present to the connecting agent (we act as the server).
    Uses a dynamically generated cert for hostname.
    """
    cert_pem, key_pem = generate_host_cert(hostname, ca_key, ca_cert)

    # Write to temp files — ssl.SSLContext needs file paths
    import tempfile
    cert_file = tempfile.NamedTemporaryFile(delete=False, suffix=".crt")
    key_file  = tempfile.NamedTemporaryFile(delete=False, suffix=".key")
    cert_file.write(cert_pem); cert_file.flush(); cert_file.close()
    key_file.write(key_pem);   key_file.flush();  key_file.close()

    ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    ctx.load_cert_chain(certfile=cert_file.name, keyfile=key_file.name)

    # Clean up temp files
    os.unlink(cert_file.name)
    os.unlink(key_file.name)

    return ctx


def make_client_ctx() -> ssl.SSLContext:
    """
    SSLContext to connect to the real upstream (we act as the client).
    Uses system CA bundle to verify the real server.
    """
    ctx = ssl.create_default_context()
    return ctx


# --- MITM Relay ---

class TLSInterceptor:
    """
    Intercepts a CONNECT tunnel, terminates TLS on both sides,
    reads plaintext, runs the injection scanner, forwards if clean.

    Usage (called from ProxyHandler.do_CONNECT after policy check):

        interceptor = TLSInterceptor(ca_key, ca_cert)
        interceptor.intercept(
            client_sock = self.connection,
            host        = host,
            port        = port,
            detail      = detail,
            policy_engine = self.policy_engine,
            event_store   = self.event_store,
            inspect_fn    = inspect_body,
            sniffer       = network_sniffer,
        )
    """

    def __init__(self, ca_key, ca_cert):
        self.ca_key  = ca_key
        self.ca_cert = ca_cert

    def intercept(self, client_sock, host: str, port: int,
                  detail: dict, policy_engine, event_store,
                  inspect_fn, sniffer) -> None:
        """
        Full MITM intercept:
          1. Wrap client_sock in TLS (we act as server for agent)
          2. Open TLS connection to real upstream
          3. Read HTTP request from agent (plaintext)
          4. Scan for injections
          5. Forward to upstream if clean / drop if malicious
          6. Stream response back to agent
        """
        import select as _select
        import time

        _rs = sniffer.on_connect(
            agent=detail.get("agent", "unknown"),
            dst_host=host, dst_port=port)
        detail["_sniffer_session"] = _rs

        # ── Step 1: Wrap client socket in TLS ─────────────────────────────
        try:
            server_ctx = make_server_ctx(host, self.ca_key, self.ca_cert)
            tls_client = server_ctx.wrap_socket(
                client_sock, server_side=True)
        except ssl.SSLError as e:
            log.warning("tls_client_wrap_failed", host=host, err=str(e))
            sniffer.on_failure(_rs)
            sniffer.on_disconnect(_rs)
            try: client_sock.close()
            except Exception: pass
            return

        # ── Step 2: Open TLS to real upstream ─────────────────────────────
        try:
            raw_upstream = socket.create_connection((host, port), timeout=30)
            client_ctx   = make_client_ctx()
            tls_upstream = client_ctx.wrap_socket(
                raw_upstream, server_hostname=host)
        except (ssl.SSLError, OSError) as e:
            log.warning("tls_upstream_failed", host=host, err=str(e))
            sniffer.on_failure(_rs)
            sniffer.on_disconnect(_rs)
            try: tls_client.close()
            except Exception: pass
            return

        # ── Step 3-6: Read, scan, forward ─────────────────────────────────
        total_bytes_out = 0
        total_bytes_in  = 0
        pol = policy_engine.get_policy(detail.get("policy"))

        try:
            # Read first HTTP request from agent (now plaintext)
            tls_client.settimeout(10.0)
            try:
                first_chunk = b""
                # Read until we have headers + full body
                while True:
                    chunk = tls_client.read(65536)
                    if not chunk:
                        break
                    first_chunk += chunk
                    # Once we have headers, check Content-Length to know body size
                    if b"\r\n\r\n" in first_chunk:
                        header_part, _, body_part = first_chunk.partition(b"\r\n\r\n")
                        # Parse Content-Length
                        content_length = 0
                        for line in header_part.split(b"\r\n"):
                            if line.lower().startswith(b"content-length:"):
                                try:
                                    content_length = int(line.split(b":", 1)[1].strip())
                                except Exception:
                                    pass
                        # Keep reading until we have the full body
                        while len(body_part) < content_length:
                            more = tls_client.read(min(65536, content_length - len(body_part)))
                            if not more:
                                break
                            body_part += more
                            first_chunk += more
                        break
                    if len(first_chunk) > 512 * 1024:
                        break
            except ssl.SSLError:
                first_chunk = b""
            tls_client.settimeout(None)

            if first_chunk:
                # ── INJECTION SCAN — we can see plaintext here ─────────────
                from inspect_utils import run_full_inspection
                # Scan only body (after headers) — avoids bearer false positive
                # on Authorization: Bearer <api-key> header
                if b"\r\n\r\n" in first_chunk:
                    _, _, scan_body = first_chunk.partition(b"\r\n\r\n")
                else:
                    scan_body = first_chunk

                score, matches, file_findings = run_full_inspection(
                    body=scan_body,
                    headers={},
                    filename=None,
                    inspect_fn=inspect_fn,
                )

                detail["injection_score"]    = score
                detail["injection_patterns"] = matches

                if score > 0:
                    detail["body_sample"] = first_chunk[:120].decode(errors="replace")
                    log.warning("https_injection_detected",
                                host=host, score=score, patterns=matches,
                                sample=detail["body_sample"][:80])

                    if pol.get("block_on_injection", True) and score >= 35:
                        # Block — send HTTP 403 back through TLS to agent
                        import json as _json
                        block_body = _json.dumps({
                            "blocked": True,
                            "reason":  f"injection:{','.join(matches)}",
                            "score":   score,
                        }).encode()
                        try:
                            tls_client.write(
                                b"HTTP/1.1 403 Forbidden\r\n"
                                b"Content-Type: application/json\r\n"
                                b"Connection: close\r\n"
                                b"Content-Length: " + str(len(block_body)).encode() +
                                b"\r\n\r\n" + block_body
                            )
                        except Exception:
                            pass

                        event_store.push({
                            "ts":                int(time.time_ns()),
                            "event":             "prompt_injection",
                            "verdict":           "block",
                            "reason":            f"injection:{','.join(matches)}",
                            "dst_host":          host,
                            "dst_port":          port,
                            "agent":             detail.get("agent", ""),
                            "injection_score":   score,
                            "injection_patterns": matches,
                            "body_sample":       detail.get("body_sample", ""),
                        })
                        sniffer.on_disconnect(_rs)
                        return

                # Forward the first chunk to upstream
                tls_upstream.write(first_chunk)
                total_bytes_out += len(first_chunk)
                sniffer.on_bytes(_rs, "out", len(first_chunk))

            # ── Relay remaining bytes in both directions ────────────────────
            socks = [tls_client, tls_upstream]
            while True:
                try:
                    readable, _, exceptional = _select.select(
                        socks, [], socks, 30.0)
                except (ValueError, OSError):
                    break
                if exceptional:
                    break
                if not readable:
                    continue
                for s in readable:
                    other = tls_upstream if s is tls_client else tls_client
                    try:
                        data = s.read(65536)
                        if not data:
                            return
                        other.write(data)
                        if s is tls_client:
                            total_bytes_out += len(data)
                            sniffer.on_bytes(_rs, "out", len(data))
                        else:
                            total_bytes_in += len(data)
                            sniffer.on_bytes(_rs, "in", len(data))
                    except (ssl.SSLError, OSError):
                        return

        finally:
            detail["response_bytes"] = total_bytes_in
            detail["request_bytes"]  = total_bytes_out
            findings = sniffer.on_disconnect(_rs)
            # Log any sniffer findings
            for sf in findings:
                event_store.push({
                    "ts":          int(time.time_ns()),
                    "event":       f"sniffer_{sf.threat_type}",
                    "verdict":     "block" if sf.score >= 60 else "alert",
                    "agent":       sf.agent,
                    "dst_host":    sf.dst_host,
                    "dst_port":    sf.dst_port,
                    "description": sf.description,
                    "evidence":    sf.evidence,
                })
            for s in (tls_client, tls_upstream):
                try: s.close()
                except Exception: pass


# --- Singleton ---

_ca_key  = None
_ca_cert = None
_interceptor: Optional[TLSInterceptor] = None


def get_interceptor() -> Optional[TLSInterceptor]:
    """Call at proxy startup to initialise the CA and interceptor."""
    global _ca_key, _ca_cert, _interceptor
    try:
        _ca_key, _ca_cert = ensure_ca()
        _interceptor = TLSInterceptor(_ca_key, _ca_cert)
        log.info("tls_interceptor_ready",
                 ca_cert=str(CA_CERT_PATH),
                 instruction="Set on agent: REQUESTS_CA_BUNDLE=/app/certs/agentguard-ca.crt")
        return _interceptor
    except Exception as e:
        log.error("tls_interceptor_init_failed", err=str(e))
        return None