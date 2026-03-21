"""
Advanced Prompt Normalizer
===========================
Strips all encoding and obfuscation layers from a prompt
BEFORE pattern matching runs. The scanner always sees
clean plaintext regardless of how the attacker encoded it.

Attack vectors handled:
  1. Binary encoding         "1101001 1100111 1101110 1101111 1110010 1100101"
  2. Hex encoding            "\\x69\\x67\\x6e\\x6f\\x72\\x65"
  3. Homoglyph substitution  Cyrillic/Greek lookalikes replacing Latin chars
  4. RTL/LTR override chars  \\u202e makes text appear reversed
  5. Zero-width chars        \\u200b splits tokens invisibly
  6. Nested encoding         base64 inside URL inside HTML entity
  7. CoT flawed premise      logical injection patterns
  8. Sleepy agent markers    hidden markdown image tags

Design:
  - Never stores normalized content permanently
  - Returns (normalized_text, List[NormalizerFinding])
  - Finding records WHAT was found, not the raw payload
  - Each layer runs in sequence — output feeds next layer
"""

import base64
import binascii
import html
import logging
import re
import unicodedata
import urllib.parse
from dataclasses import dataclass, field
from typing import List, Optional, Tuple

log = logging.getLogger("normalizer")


@dataclass
class NormalizerFinding:
    """Evidence that obfuscation was detected and stripped."""
    layer:       str    # which normalizer caught it
    description: str    # what was found
    risk:        str    # "encoding" | "obfuscation" | "structural" | "semantic"
    score_bonus: int    # extra score to add for using this obfuscation


# ── Homoglyph map ──────────────────────────────────────────────────────────────
# Maps visually identical Unicode characters to their ASCII equivalent.
# Covers Cyrillic, Greek, and other lookalike alphabets.

HOMOGLYPH_MAP = {
    # Cyrillic → Latin
    'а': 'a', 'е': 'e', 'о': 'o', 'р': 'p', 'с': 'c',
    'х': 'x', 'у': 'y', 'і': 'i', 'ѕ': 's', 'ԁ': 'd',
    'ɡ': 'g', 'ʜ': 'h', 'ĸ': 'k', 'ʟ': 'l', 'ɴ': 'n',
    'ǫ': 'q', 'ʀ': 'r', 'ᴛ': 't', 'ᴠ': 'v', 'ᴡ': 'w',
    'ʏ': 'y', 'ᴢ': 'z',
    # Greek lookalikes
    'α': 'a', 'β': 'b', 'ε': 'e', 'ι': 'i', 'κ': 'k',
    'ν': 'n', 'ο': 'o', 'ρ': 'p', 'τ': 't', 'υ': 'u',
    'χ': 'x',
    # Arabic lookalikes
    'а': 'a', 'е': 'e', 'о': 'o',
    # Extended Latin lookalikes
    'ɡ': 'g', 'ʂ': 's', 'ɾ': 'r',
    'ɫ': 'l', 'ɭ': 'l', 'ɰ': 'm',
    'ɱ': 'm', 'ɳ': 'n', 'ɴ': 'n',
    'ɸ': 'p', 'ɼ': 'r', 'ʀ': 'r',
    'ʃ': 's', 'ʈ': 't', 'ʋ': 'v',
    'ʍ': 'w', 'ʏ': 'y', 'ʐ': 'z',
    # IPA lookalikes
    'ɑ': 'a', 'ɒ': 'a', 'ɔ': 'o',
    'ɛ': 'e', 'ɜ': 'e', 'ɩ': 'i',
    'ɪ': 'i', 'ʊ': 'u', 'ʌ': 'v',
    # Superscript/subscript lookalikes
    '¹': '1', '²': '2', '³': '3',
    '⁰': '0', '⁴': '4', '⁵': '5',
    '⁶': '6', '⁷': '7', '⁸': '8',
    '⁹': '9',
    # Mathematical bold/italic lookalikes
    '𝐚': 'a', '𝐛': 'b', '𝐜': 'c', '𝐝': 'd', '𝐞': 'e',
    '𝐟': 'f', '𝐠': 'g', '𝐡': 'h', '𝐢': 'i', '𝐣': 'j',
    # Fullwidth ASCII
    '！': '!', '＂': '"', '＃': '#', '＄': '$', '％': '%',
    '＆': '&', '＇': "'", '（': '(', '）': ')', '＊': '*',
    '＋': '+', '，': ',', '－': '-', '．': '.', '／': '/',
    '０': '0', '１': '1', '２': '2', '３': '3', '４': '4',
    '５': '5', '６': '6', '７': '7', '８': '8', '９': '9',
    '：': ':', '；': ';', '＜': '<', '＝': '=', '＞': '>',
    '？': '?', '＠': '@',
    'Ａ': 'A', 'Ｂ': 'B', 'Ｃ': 'C', 'Ｄ': 'D', 'Ｅ': 'E',
    'Ｆ': 'F', 'Ｇ': 'G', 'Ｈ': 'H', 'Ｉ': 'I', 'Ｊ': 'J',
    'Ｋ': 'K', 'Ｌ': 'L', 'Ｍ': 'M', 'Ｎ': 'N', 'Ｏ': 'O',
    'Ｐ': 'P', 'Ｑ': 'Q', 'Ｒ': 'R', 'Ｓ': 'S', 'Ｔ': 'T',
    'Ｕ': 'U', 'Ｖ': 'V', 'Ｗ': 'W', 'Ｘ': 'X', 'Ｙ': 'Y',
    'Ｚ': 'Z',
    'ａ': 'a', 'ｂ': 'b', 'ｃ': 'c', 'ｄ': 'd', 'ｅ': 'e',
    'ｆ': 'f', 'ｇ': 'g', 'ｈ': 'h', 'ｉ': 'i', 'ｊ': 'j',
    'ｋ': 'k', 'ｌ': 'l', 'ｍ': 'm', 'ｎ': 'n', 'ｏ': 'o',
    'ｐ': 'p', 'ｑ': 'q', 'ｒ': 'r', 'ｓ': 's', 'ｔ': 't',
    'ｕ': 'u', 'ｖ': 'v', 'ｗ': 'w', 'ｘ': 'x', 'ｙ': 'y',
    'ｚ': 'z',
}

# ── Invisible / control characters to strip ────────────────────────────────────

INVISIBLE_CHARS = [
    '\u200b',  # zero-width space
    '\u200c',  # zero-width non-joiner
    '\u200d',  # zero-width joiner
    '\u2060',  # word joiner
    '\ufeff',  # zero-width no-break space (BOM)
    '\u00ad',  # soft hyphen
    '\u034f',  # combining grapheme joiner
    '\u2028',  # line separator
    '\u2029',  # paragraph separator
]

RTL_CHARS = [
    '\u202e',  # right-to-left override
    '\u202d',  # left-to-right override
    '\u202c',  # pop directional formatting
    '\u202b',  # right-to-left embedding
    '\u202a',  # left-to-right embedding
    '\u200f',  # right-to-left mark
    '\u200e',  # left-to-right mark
    '\u061c',  # arabic letter mark
]

# ── Sleepy agent / CoT patterns ────────────────────────────────────────────────

SLEEPY_PATTERNS = [
    (r'!\[.*?\]\(https?://[^\)]+\)',
     "hidden image markdown — possible sleepy agent tracker"),
    (r'<img[^>]+src=["\']https?://[^"\']+["\']',
     "hidden HTML img tag — possible tracking pixel"),
    (r'!\[img\]\(',
     "blank image markdown — classic sleepy agent pattern"),
]

COT_POISON_PATTERNS = [
    (r'remember[,\s]+all\s+\w+\s+have',
     "flawed premise injection — 'remember all X have'"),
    (r'this is the first and most important (step|rule)',
     "CoT step injection — prioritized false rule"),
    (r'always begin your reasoning by',
     "CoT forging — injected reasoning step"),
    (r'as a special rule[,\s]',
     "special rule injection pattern"),
    (r'hidden rule[:\s]',
     "hidden rule injection"),
    (r'secret(ly)?\s+(add|append|include|insert)',
     "covert instruction to modify output"),
    (r'do not (tell|mention|acknowledge|inform)',
     "suppression instruction"),
    (r'without (telling|mentioning|informing|letting)',
     "covert action instruction"),
]


class AdvancedNormalizer:
    """
    Multi-layer prompt normalizer.

    Usage:
        normalizer = AdvancedNormalizer()
        clean_text, findings = normalizer.normalize(raw_prompt)
        # Use clean_text for pattern scanning
        # findings records what obfuscation was stripped
    """

    def __init__(self, max_decode_depth: int = 5):
        self.max_decode_depth = max_decode_depth

    def normalize(self, text: str,
                  source: str = "direct") -> Tuple[str, List[NormalizerFinding]]:
        """
        Run all normalization layers in sequence.

        Args:
            text:   Raw prompt text
            source: "direct" | "ocr" | "pdf" | "tool_result" | "web"
                    Untrusted sources get stricter thresholds downstream

        Returns:
            (normalized_text, findings)
        """
        findings: List[NormalizerFinding] = []
        current = text

        # Layer 1: Strip invisible and RTL control characters
        current, f = self._strip_invisible(current)
        findings += f

        # Layer 2: Homoglyph normalization
        current, f = self._normalize_homoglyphs(current)
        findings += f

        # Layer 3: Unicode normalization (NFC)
        current = unicodedata.normalize('NFC', current)

        # Layer 4: HTML entity decode
        current, f = self._decode_html_entities(current)
        findings += f

        # Layer 5: URL decode
        current, f = self._decode_url(current)
        findings += f

        # Layer 6: Hex escape decode (\x69\x67...)
        current, f = self._decode_hex_escapes(current)
        findings += f

        # Layer 7: Binary decode (space-separated 8-bit groups)
        current, f = self._decode_binary(current)
        findings += f

        # Layer 8: Nested base64 unwrapping (recursive up to max_depth)
        current, f = self._unwrap_base64(current, depth=0)
        findings += f

        # Layer 9: Sleepy agent response markers
        f = self._detect_sleepy_agent(current)
        findings += f

        # Layer 10: CoT forging / flawed premise
        f = self._detect_cot_poison(current)
        findings += f

        # Layer 11: Context window overflow detection
        f = self._detect_context_overflow(current)
        findings += f

        # Log if obfuscation was found
        if findings:
            log.warning(f"Normalizer: {len(findings)} obfuscation "
                        f"layer(s) detected from source={source}")

        return current, findings

    def score_bonus(self, findings: List[NormalizerFinding]) -> int:
        """Total extra score for using obfuscation techniques."""
        return sum(f.score_bonus for f in findings)

    # ── Layer implementations ──────────────────────────────────────────────────

    def _strip_invisible(self, text: str) -> Tuple[str, List[NormalizerFinding]]:
        findings = []
        result   = text

        rtl_found = any(c in text for c in RTL_CHARS)
        if rtl_found:
            for c in RTL_CHARS:
                result = result.replace(c, '')
            findings.append(NormalizerFinding(
                layer       = "rtl_strip",
                description = "RTL/LTR override characters removed — text direction manipulation",
                risk        = "obfuscation",
                score_bonus = 40,
            ))

        inv_found = any(c in text for c in INVISIBLE_CHARS)
        if inv_found:
            for c in INVISIBLE_CHARS:
                result = result.replace(c, '')
            findings.append(NormalizerFinding(
                layer       = "zero_width_strip",
                description = "Zero-width / invisible characters removed — token splitting attack",
                risk        = "obfuscation",
                score_bonus = 35,
            ))

        return result, findings

    def _normalize_homoglyphs(self, text: str) -> Tuple[str, List[NormalizerFinding]]:
        findings    = []
        result      = []
        found_glyphs = []

        for ch in text:
            if ch in HOMOGLYPH_MAP:
                result.append(HOMOGLYPH_MAP[ch])
                found_glyphs.append(ch)
            else:
                result.append(ch)

        if found_glyphs:
            unique = list(set(found_glyphs))[:5]
            findings.append(NormalizerFinding(
                layer       = "homoglyph_normalize",
                description = f"Homoglyph characters normalized: {unique} — visual lookalike attack",
                risk        = "obfuscation",
                score_bonus = 50,
            ))

        return "".join(result), findings

    def _decode_html_entities(self, text: str) -> Tuple[str, List[NormalizerFinding]]:
        findings = []
        decoded  = html.unescape(text)
        if decoded != text:
            findings.append(NormalizerFinding(
                layer       = "html_entity_decode",
                description = "HTML entities decoded (e.g. &#105; → i)",
                risk        = "encoding",
                score_bonus = 30,
            ))
        return decoded, findings

    def _decode_url(self, text: str) -> Tuple[str, List[NormalizerFinding]]:
        findings = []
        try:
            decoded = urllib.parse.unquote(text)
            if decoded != text:
                findings.append(NormalizerFinding(
                    layer       = "url_decode",
                    description = "URL encoding decoded (e.g. %69 → i)",
                    risk        = "encoding",
                    score_bonus = 25,
                ))
            return decoded, findings
        except Exception:
            return text, findings

    def _decode_hex_escapes(self, text: str) -> Tuple[str, List[NormalizerFinding]]:
        """Decode \\x69\\x67 style hex escapes."""
        findings = []

        patterns = [
            r'\\x([0-9a-fA-F]{2})',       # \x69
            r'\\u([0-9a-fA-F]{4})',        # \u0069
            r'0x([0-9a-fA-F]{2})(?:\s|,)', # 0x69 (space or comma separated)
        ]

        result  = text
        changed = False

        for pat in patterns:
            def replace_hex(m):
                nonlocal changed
                try:
                    ch = chr(int(m.group(1), 16))
                    if ch.isprintable():
                        changed = True
                        return ch
                except Exception:
                    pass
                return m.group(0)
            result = re.sub(pat, replace_hex, result)

        if changed:
            findings.append(NormalizerFinding(
                layer       = "hex_escape_decode",
                description = "Hex escape sequences decoded (\\x69 → i style)",
                risk        = "encoding",
                score_bonus = 45,
            ))

        return result, findings

    def _decode_binary(self, text: str) -> Tuple[str, List[NormalizerFinding]]:
        """Decode space-separated binary like '1101001 1100111 ...'"""
        findings = []

        # Match 5+ consecutive 7-8 bit groups (attackers strip leading zeros)
        pattern = r'\b([01]{7,8})(?:\s+[01]{7,8}){4,}\b'
        match   = re.search(pattern, text)

        if not match:
            return text, findings

        binary_str = match.group(0)
        bits       = binary_str.split()

        try:
            decoded = ''.join(chr(int(b, 2)) for b in bits)
            if decoded.isprintable() and len(decoded) > 3:
                result = text.replace(binary_str, decoded)
                findings.append(NormalizerFinding(
                    layer       = "binary_decode",
                    description = f"Binary encoding decoded: {len(bits)} 8-bit groups",
                    risk        = "encoding",
                    score_bonus = 60,
                ))
                return result, findings
        except Exception:
            pass

        return text, findings

    def _unwrap_base64(self, text: str,
                       depth: int) -> Tuple[str, List[NormalizerFinding]]:
        """Recursively unwrap base64 encoded content up to max_decode_depth."""
        findings = []

        if depth >= self.max_decode_depth:
            return text, findings

        # Find base64-like strings (min 20 chars, valid alphabet)
        b64_pattern = r'[A-Za-z0-9+/]{20,}={0,2}'
        matches     = re.findall(b64_pattern, text)

        result  = text
        changed = False

        for m in matches:
            try:
                # Pad if needed
                padded  = m + '=' * (-len(m) % 4)
                decoded = base64.b64decode(padded).decode('utf-8', errors='strict')
                # Only replace if decoded is printable text
                if (decoded.isprintable() and
                        len(decoded) > 5 and
                        not decoded == m):
                    result  = result.replace(m, decoded, 1)
                    changed = True
            except Exception:
                continue

        if changed:
            findings.append(NormalizerFinding(
                layer       = f"base64_unwrap_depth_{depth+1}",
                description = f"Base64 decoded (nesting level {depth+1})",
                risk        = "encoding",
                score_bonus = 35 + (depth * 15),  # deeper nesting = higher score
            ))
            # Recurse — handle nested encodings
            result, deeper = self._unwrap_base64(result, depth + 1)
            findings += deeper

        return result, findings

    def _detect_sleepy_agent(self, text: str) -> List[NormalizerFinding]:
        """Detect hidden markdown/HTML that could beacon to an attacker server."""
        findings = []

        for pattern, description in SLEEPY_PATTERNS:
            if re.search(pattern, text, re.IGNORECASE):
                findings.append(NormalizerFinding(
                    layer       = "sleepy_agent_detect",
                    description = description,
                    risk        = "semantic",
                    score_bonus = 80,
                ))

        return findings

    def _detect_cot_poison(self, text: str) -> List[NormalizerFinding]:
        """Detect Chain-of-Thought forging / flawed premise injection."""
        findings = []
        text_lower = text.lower()

        for pattern, description in COT_POISON_PATTERNS:
            if re.search(pattern, text_lower):
                findings.append(NormalizerFinding(
                    layer       = "cot_poison_detect",
                    description = description,
                    risk        = "semantic",
                    score_bonus = 65,
                ))

        return findings

    def _detect_context_overflow(self, text: str) -> List[NormalizerFinding]:
        """
        Detect context window flooding attacks.
        Estimates token count and flags if suspiciously large
        relative to meaningful content.
        """
        findings = []

        # Rough token estimate: ~4 chars per token
        estimated_tokens = len(text) / 4
        # Most models have 8k-128k context windows
        # Flag if prompt exceeds 6000 tokens (likely flooding)
        # Two detection strategies:
        # 1. Large prompt with low word diversity = padding flood
        # 2. Any prompt > 500 tokens with any repetitive phrases = suspicious
        if estimated_tokens > 500:
            words        = text.lower().split()
            unique_words = set(words)
            diversity    = len(unique_words) / max(len(words), 1)
            word_count   = len(words)

            # Detect repetition: any single word appearing > 15% of all words
            from collections import Counter
            top_word, top_count = Counter(words).most_common(1)[0] if words else ("", 0)
            repetition_rate = top_count / max(word_count, 1)

            is_flood = (
                (estimated_tokens > 3000 and diversity < 0.4) or
                (repetition_rate > 0.15 and estimated_tokens > 300) or
                (diversity < 0.05 and estimated_tokens > 200)
            )

            if is_flood:
                findings.append(NormalizerFinding(
                    layer       = "context_overflow",
                    description = (
                        f"Context flooding detected: ~{int(estimated_tokens)} tokens, "
                        f"{diversity:.0%} word diversity, "
                        f"top word '{top_word}' repeats {repetition_rate:.0%} — "
                        f"system prompt push-out attack"
                    ),
                    risk        = "structural",
                    score_bonus = 75,
                ))

        return findings


advanced_normalizer = AdvancedNormalizer()