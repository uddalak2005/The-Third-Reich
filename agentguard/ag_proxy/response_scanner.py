"""
Response Scanner
=================
Scans what the LLM sends BACK to the agent — not just
what goes in. This catches:

  1. Sleepy agent hidden markdown/image trackers
  2. Data in response that should not be there (API keys etc.)
  3. CoT manipulation visible in the response
  4. Suppressed content (agent hiding things from user)
  5. Tool call hijacking evidence in response text

From the blog:
  "The user only sees the harmless summary. But in the
   background, the AI's raw response included the malicious
   markdown. The user's chat client tried to render this
   'image,' which was actually a web request to the
   attacker's server."

This scanner runs on the RESPONSE body before it reaches
the calling agent.
"""

import logging
import re
from dataclasses import dataclass, field
from typing import List, Tuple

log = logging.getLogger("response_scanner")


@dataclass
class ResponseFinding:
    threat_type:  str
    description:  str
    severity:     str    # low / medium / high / critical
    score:        int
    evidence:     str    # short excerpt — never full content


RESPONSE_PATTERNS = [
    # Sleepy agent hidden trackers
    (r'!\[[^\]]*\]\(https?://[^\)]+\)',
     "hidden_markdown_image",
     "Hidden markdown image — possible data exfiltration beacon",
     "critical", 95),

    (r'<img[^>]+src=["\']https?://[^"\']+["\'][^>]*>',
     "hidden_html_image",
     "Hidden HTML img tag — tracking pixel",
     "critical", 90),

    (r'!\[img\]\(https?://',
     "sleepy_agent_marker",
     "Classic sleepy agent image pattern",
     "critical", 95),

    # Credential patterns in response (data leakage)
    (r'sk-[a-zA-Z0-9-]{15,}',
     "openai_key_in_response",
     "OpenAI API key pattern in LLM response",
     "critical", 90),

    (r'AKIA[0-9A-Z]{16}',
     "aws_key_in_response",
     "AWS access key in LLM response",
     "critical", 90),

    (r'ghp_[a-zA-Z0-9]{36}',
     "github_token_in_response",
     "GitHub PAT in LLM response",
     "critical", 90),

    (r'-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----',
     "private_key_in_response",
     "Private key in LLM response",
     "critical", 100),

    # Tool call hijacking evidence
    (r'(upload|POST|send|transmit).{0,50}(http|ftp)s?://',
     "tool_exfil_instruction",
     "Response instructs data upload to external URL",
     "high", 80),

    (r'(access|read|open|load).{0,30}(\/etc\/|\.env|config|secret|credential)',
     "file_access_instruction",
     "Response instructs access to sensitive file paths",
     "high", 75),

    (r'(write|save|create).{0,30}\.zip',
     "archive_creation_instruction",
     "Response instructs creation of archive — data staging",
     "high", 70),

    # CoT manipulation evidence in response
    (r'step 1[:\s]+.{0,50}(x marks|treasure|special rule)',
     "cot_poison_in_response",
     "CoT forging evidence in response reasoning",
     "high", 75),

    (r'(not|never) (mention|say|tell|acknowledge|reveal)',
     "suppression_in_response",
     "Response contains suppression instruction",
     "medium", 55),

    # MITM sabotage pattern (adding "not" to commitments)
    (r'\bwill not\b.{0,30}(send|share|provide|give|upload)',
     "mitm_negation",
     "Possible MITM negation of user commitment",
     "medium", 50),
]


class ResponseScanner:
    """
    Scans LLM response bodies before they reach the calling agent.

    Usage:
        scanner = ResponseScanner()
        findings, total_score = scanner.scan(response_text)
        if total_score >= 35:
            # Block or sanitize the response
    """

    def __init__(self, block_threshold: int = 35):
        self.block_threshold = block_threshold

    def scan(self, response_text: str) -> Tuple[List[ResponseFinding], int]:
        """
        Scan a response body.
        Returns (findings, total_score).
        If total_score >= block_threshold, response should be blocked.
        """
        findings     = []
        total_score  = 0
        seen_types   = set()

        for pattern, threat_type, description, severity, score in RESPONSE_PATTERNS:
            if re.search(pattern, response_text, re.IGNORECASE | re.DOTALL):
                # Deduplicate same threat type
                score_to_add = score if threat_type not in seen_types else score // 4
                seen_types.add(threat_type)
                total_score += score_to_add

                # Extract short evidence excerpt
                match = re.search(pattern, response_text,
                                  re.IGNORECASE | re.DOTALL)
                if match:
                    start   = max(0, match.start() - 20)
                    end     = min(len(response_text), match.end() + 20)
                    excerpt = response_text[start:end].replace('\n', ' ')[:80]
                else:
                    excerpt = ""

                findings.append(ResponseFinding(
                    threat_type = threat_type,
                    description = description,
                    severity    = severity,
                    score       = score_to_add,
                    evidence    = excerpt,
                ))

        if findings:
            log.warning(f"Response scanner: {len(findings)} findings, "
                        f"score={total_score}, "
                        f"blocked={total_score >= self.block_threshold}")

        return findings, total_score

    def sanitize(self, response_text: str) -> Tuple[str, List[ResponseFinding]]:
        """
        Remove detectable threats from response instead of blocking entirely.
        Returns (sanitized_text, findings).
        Use when you want to pass a cleaned response rather than block.
        """
        findings       = []
        sanitized      = response_text

        # Remove hidden markdown images
        hidden_img = re.compile(
            r'!\[[^\]]*\]\(https?://[^\)]+\)', re.IGNORECASE)
        if hidden_img.search(sanitized):
            sanitized = hidden_img.sub('[REMOVED: hidden tracker]', sanitized)
            findings.append(ResponseFinding(
                threat_type = "hidden_markdown_image",
                description = "Hidden markdown image removed from response",
                severity    = "critical",
                score       = 95,
                evidence    = "removed",
            ))

        # Remove hidden HTML images
        html_img = re.compile(
            r'<img[^>]+src=["\']https?://[^"\']+["\'][^>]*>',
            re.IGNORECASE)
        if html_img.search(sanitized):
            sanitized = html_img.sub('[REMOVED: tracking pixel]', sanitized)
            findings.append(ResponseFinding(
                threat_type = "hidden_html_image",
                description = "Hidden HTML img removed from response",
                severity    = "critical",
                score       = 90,
                evidence    = "removed",
            ))

        return sanitized, findings


response_scanner = ResponseScanner()