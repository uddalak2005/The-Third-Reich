"""
Common inspection logic shared across the proxy.
"""
from typing import Tuple, List, Optional


def run_full_inspection(body: bytes, headers: dict,
                        filename: Optional[str],
                        inspect_fn) -> Tuple[int, List[str], list]:
    """
    Run injection scan + optional file inspection.
    Returns (score, pattern_matches, file_findings).
    """
    score, matches = inspect_fn(body)
    file_findings  = []

    # File upload inspection if multipart
    content_type = (headers or {}).get(
        "content-type",
        (headers or {}).get("Content-Type", "")
    ) or ""

    if body and "multipart/form-data" in content_type.lower():
        try:
            import sys
            from pathlib import Path
            _backend = Path(__file__).parent.parent / "backend"
            if str(_backend) not in sys.path:
                sys.path.insert(0, str(_backend))
            from file_inspector import file_inspector
            results = file_inspector.inspect_multipart(body, content_type)
            for fr in results:
                if fr.is_malicious:
                    score = max(score, fr.total_score)
                    file_findings.append(fr)
        except ImportError:
            pass

    return score, matches, file_findings