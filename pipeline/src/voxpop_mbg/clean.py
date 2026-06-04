"""Text cleaning, sensitive-data masking, and normalization."""

from __future__ import annotations

import re

from .normalize import normalize_tokens

URL_RE = re.compile(r"https?://\S+|www\.\S+", flags=re.IGNORECASE)
MENTION_RE = re.compile(r"@\S+")
EMAIL_RE = re.compile(r"[\w.\-]+@[\w.\-]+\.\w+")
PHONE_RE = re.compile(r"(?:\+?\d[\s\-]?){8,}\d")
HASHTAG_RE = re.compile(r"#(\w+)")
REPEAT_CHAR_RE = re.compile(r"(.)\1{2,}")
MULTISPACE_RE = re.compile(r"\s+")
PUNCT_RUN_RE = re.compile(r"([!?.,])\1{1,}")
NON_MEANINGFUL_RE = re.compile(r"[^\w\s!?.,'-]", flags=re.UNICODE)

# Negation and issue-bearing words preserved through cleaning.
PROTECTED_WORDS = {
    "tidak",
    "bukan",
    "jangan",
    "belum",
    "tanpa",
    "kurang",
}


def mask_sensitive(text: str) -> str:
    """Mask URLs, emails, phone-like sequences, and mentions."""
    text = URL_RE.sub(" ", text)
    text = EMAIL_RE.sub(" ", text)
    text = MENTION_RE.sub(" ", text)
    text = PHONE_RE.sub(" ", text)
    text = HASHTAG_RE.sub(r"\1", text)
    return text


def basic_normalize(text: str) -> str:
    """Lowercase and collapse whitespace for deduplication keys."""
    text = (text or "").lower()
    text = MULTISPACE_RE.sub(" ", text)
    return text.strip()


def clean_text(raw_text: str) -> str:
    """Produce an analysis-ready version of a comment.

    Keeps negation words and meaningful content while removing noise. The raw
    text is retained separately for traceability.
    """
    if not raw_text:
        return ""

    text = raw_text.lower()
    text = mask_sensitive(text)
    text = REPEAT_CHAR_RE.sub(r"\1\1", text)
    text = PUNCT_RUN_RE.sub(r"\1", text)
    text = NON_MEANINGFUL_RE.sub(" ", text)
    text = normalize_tokens(text)
    text = MULTISPACE_RE.sub(" ", text)
    return text.strip()


def dedupe_key(clean: str) -> str:
    """Normalization key used to detect exact duplicate comments."""
    key = re.sub(r"[^\w\s]", "", clean)
    key = MULTISPACE_RE.sub(" ", key)
    return key.strip()
