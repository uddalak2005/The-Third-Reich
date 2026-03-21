"""
Verify Routes
==============
Secure prompt verification endpoint for external agents.
Your friend's Hollow Key Protocol calls this to check
whether a prompt is safe before using it.

Endpoints:
  POST /api/verify/prompt    — check a prompt, get verdict + signature
  POST /api/verify/response  — check an LLM response for sleepy agent etc.
  GET  /api/verify/health    — verify service is up and signing key is set

Security:
  - Every verdict response is HMAC-SHA256 signed
  - Caller verifies signature before trusting verdict
  - Prevents MITM from swapping BLOCK→ALLOW verdict
  - Stunnel config provided separately for TLS channel security

Wire format — request:
  {
    "prompt":    "text to verify",
    "agent_id":  "hollow-key-agent",
    "source":    "direct" | "ocr" | "pdf" | "tool_result"
  }

Wire format — response (clean):
  {
    "verdict":    "ALLOW",
    "prompt":     "text to verify",
    "score":      0,
    "findings":   [],
    "timestamp":  1234567890,
    "signature":  "hmac-sha256-hex"
  }

Wire format — response (malicious):
  {
    "verdict":    "BLOCK",
    "prompt":     null,
    "score":      88,
    "findings":   [{"layer": "binary_decode", "description": "..."}],
    "timestamp":  1234567890,
    "signature":  "hmac-sha256-hex"
  }
"""

import hashlib
import hmac
import json
import logging
import os
import time
from typing import Optional

from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel

log = logging.getLogger("verify_routes")

verify_router = APIRouter(tags=["verify"])

# ── Signing secret ─────────────────────────────────────────────────────────────
# Set AGENTGUARD_SIGNING_SECRET in your environment.
# Share the SAME secret with your friend out-of-band (not through the API).
# Both sides use it to sign/verify responses.

_SIGNING_SECRET = os.environ.get(
    "AGENTGUARD_SIGNING_SECRET", "change-this-secret-before-production"
)

if _SIGNING_SECRET == "change-this-secret-before-production":
    log.warning("AGENTGUARD_SIGNING_SECRET not set — using default. "
                "Set this env var before sharing with your friend.")


# ── Pydantic models ────────────────────────────────────────────────────────────

class PromptVerifyRequest(BaseModel):
    prompt:   str
    agent_id: str  = "external-agent"
    source:   str  = "direct"   # direct | ocr | pdf | tool_result | web


class ResponseVerifyRequest(BaseModel):
    response: str
    agent_id: str = "external-agent"


# ── HMAC signing ───────────────────────────────────────────────────────────────

def _sign(verdict: str, score: int, timestamp: int,
          prompt: Optional[str]) -> str:
    """
    Sign the verdict response.
    Message = verdict:score:timestamp:prompt_hash
    Using prompt_hash (not prompt) so signature does not expose content.
    """
    prompt_hash = hashlib.sha256(
        (prompt or "").encode()
    ).hexdigest()[:16]

    message = f"{verdict}:{score}:{timestamp}:{prompt_hash}"
    return hmac.new(
        _SIGNING_SECRET.encode(),
        message.encode(),
        hashlib.sha256,
    ).hexdigest()


def _build_response(verdict: str, prompt: Optional[str],
                    score: int, findings: list,
                    message: str = "") -> dict:
    """Build a signed verdict response."""
    timestamp = int(time.time())
    signature = _sign(verdict, score, timestamp, prompt)

    return {
        "verdict":    verdict,
        "prompt":     prompt,      # None if BLOCK — never return malicious content
        "score":      score,
        "findings":   findings,
        "message":    message,
        "timestamp":  timestamp,
        "signature":  signature,
    }


# ── Routes ─────────────────────────────────────────────────────────────────────

@verify_router.post(
    "/api/verify/prompt",
    summary="Verify a prompt — returns BLOCK or ALLOW verdict with HMAC signature",
)
async def verify_prompt(body: PromptVerifyRequest):
    """
    Full pipeline:
      1. Advanced normalizer strips obfuscation
      2. Pattern scanner runs on clean text
      3. Score computed including obfuscation bonus
      4. Verdict returned with HMAC signature

    Your friend verifies the signature before using the verdict.
    If signature fails → possible MITM → reject.
    """
    try:
        from ag_proxy.advanced_normalizer import advanced_normalizer
        from ag_proxy.proxy import inspect_body
    except ImportError as e:
        import traceback
        log.error(f"Import error: {e}\n{traceback.format_exc()}")
        raise HTTPException(503, f"Scanner not available: {e}")

    # Source trust level
    source        = body.source
    # Untrusted sources get lower block threshold
    block_threshold = 35 if source == "direct" else 20

    # Step 1: Normalize — strip all obfuscation layers
    normalized_text, norm_findings = advanced_normalizer.normalize(
        body.prompt, source=source)

    # Step 2: Pattern scan on normalized text
    score, matched_patterns, _ = _run_scanner(
        normalized_text, inspect_body)

    # Step 3: Add obfuscation score bonus
    obfuscation_bonus = advanced_normalizer.score_bonus(norm_findings)
    total_score       = score + obfuscation_bonus

    # Step 4: Build findings list for response
    findings = [
        {"layer": f.layer, "description": f.description,
         "risk": f.risk, "score_bonus": f.score_bonus}
        for f in norm_findings
    ]
    if matched_patterns:
        findings.append({
            "layer":       "pattern_scanner",
            "description": f"Injection patterns matched: {matched_patterns}",
            "risk":        "injection",
            "score_bonus": score,
        })

    # Step 5: Verdict
    if total_score >= block_threshold:
        log.warning(
            f"BLOCK verdict: agent={body.agent_id} "
            f"score={total_score} source={source} "
            f"patterns={matched_patterns} "
            f"obfuscation={[f.layer for f in norm_findings]}"
        )
        return _build_response(
            verdict  = "BLOCK",
            prompt   = None,     # never return malicious prompt
            score    = total_score,
            findings = findings,
            message  = (f"Prompt blocked — score {total_score} "
                        f"exceeds threshold {block_threshold}. "
                        f"Patterns: {matched_patterns}. "
                        f"Obfuscation: {[f.layer for f in norm_findings]}"),
        )

    log.info(f"ALLOW verdict: agent={body.agent_id} "
             f"score={total_score} source={source}")
    return _build_response(
        verdict  = "ALLOW",
        prompt   = body.prompt,   # return original (not normalized) if clean
        score    = total_score,
        findings = findings,
        message  = "Prompt verified — no threats detected",
    )


@verify_router.post(
    "/api/verify/prompt/simple",
    summary="Simple verification for JSON-based friends",
)
async def verify_prompt_simple(body: PromptVerifyRequest):
    """
    Simplified endpoint that returns true/false for 'approved'.
    Matches the friend's JSON requirement.
    """
    response = await verify_prompt(body)
    return {
        "approved": response.get("verdict") == "ALLOW"
    }


@verify_router.post(
    "/api/verify/response",
    summary="Verify an LLM response — catches sleepy agent, CoT manipulation",
)
async def verify_response(body: ResponseVerifyRequest):
    """
    Scan what the LLM sent back.
    Catches hidden markdown trackers, tool exfil instructions,
    CoT forging evidence, credential leakage in responses.
    """
    try:
        from proxy.response_scanner import response_scanner
    except ImportError as e:
        raise HTTPException(503, f"Response scanner not available: {e}")

    findings, total_score = response_scanner.scan(body.response)

    findings_list = [
        {"threat_type": f.threat_type,
         "description": f.description,
         "severity":    f.severity,
         "evidence":    f.evidence}
        for f in findings
    ]

    if total_score >= 35:
        # Sanitize — remove detected threats from response
        sanitized, _ = response_scanner.sanitize(body.response)
        log.warning(f"Response BLOCK: agent={body.agent_id} "
                    f"score={total_score} threats={len(findings)}")
        return _build_response(
            verdict  = "BLOCK",
            prompt   = None,
            score    = total_score,
            findings = findings_list,
            message  = f"Response blocked — {len(findings)} threat(s) found",
        )

    return _build_response(
        verdict  = "ALLOW",
        prompt   = body.response,
        score    = total_score,
        findings = findings_list,
        message  = "Response verified — no threats detected",
    )


@verify_router.get(
    "/api/verify/health",
    summary="Verify service health and signing key status",
)
async def verify_health():
    signing_configured = _SIGNING_SECRET != "change-this-secret-before-production"
    return {
        "status":              "ok",
        "signing_configured":  signing_configured,
        "signing_key_hint":    _SIGNING_SECRET[:4] + "****" if signing_configured else "NOT SET",
        "endpoints": {
            "verify_prompt":   "POST /api/verify/prompt",
            "verify_response": "POST /api/verify/response",
        },
    }


# ── Helper ─────────────────────────────────────────────────────────────────────

def _run_scanner(text: str, inspect_body) -> tuple:
    """Run the existing inject_body scanner on normalized text."""
    try:
        score, matches = inspect_body(text.encode("utf-8", errors="replace"))
        return score, matches, []
    except Exception as e:
        log.error(f"Scanner error: {e}")
        return 0, [], []
