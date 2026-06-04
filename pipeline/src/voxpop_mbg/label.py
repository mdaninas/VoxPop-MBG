"""Transparent weak labeling for sentiment.

Labels are derived from curated Indonesian keyword lists. They are used either
as the final output (lexicon mode) or as training signal for a TF-IDF model.
The rules are deliberately simple and auditable; they are not a substitute for
human-reviewed labels.
"""

from __future__ import annotations

import re

POSITIVE_TERMS = [
    "bagus",
    "baik",
    "setuju",
    "dukung",
    "mendukung",
    "bermanfaat",
    "manfaat",
    "membantu",
    "terbantu",
    "merata",
    "mantap",
    "alhamdulillah",
    "semoga",
    "sukses",
    "lanjutkan",
    "hebat",
    "keren",
    "senang",
    "bersyukur",
    "syukur",
    "berkualitas",
    "sehat",
    "enak",
    "suka",
    "amanah",
    "salut",
    "apresiasi",
    "semangat",
    "peduli",
    "terbaik",
    "oke",
    "sip",
    "betul",
    "setuju banget",
    "niat baik",
]

NEGATIVE_TERMS = [
    "takut",
    "basi",
    "busuk",
    "racun",
    "beracun",
    "keracunan",
    "tidak layak",
    "pencitraan",
    "korupsi",
    "korup",
    "boros",
    "tidak percaya",
    "gagal",
    "kacau",
    "komplain",
    "mengecewakan",
    "kecewa",
    "buruk",
    "jelek",
    "sakit",
    "mubazir",
    "settingan",
    "bohong",
    "menipu",
    "omong kosong",
    "parah",
    "salah",
    "mending",
    "percuma",
    "sia-sia",
    "ngawur",
    "ngaco",
    "amburadul",
    "mahal",
    "telat",
    "terlambat",
    "ribet",
    "miris",
    "prihatin",
    "kasihan",
    "malas",
    "hancur",
    "ngeri",
    "stop",
]

NEUTRAL_TERMS = [
    "kapan",
    "dimana",
    "bagaimana",
    "mulai kapan",
    "siapa",
    "apakah",
    "berapa",
    "kenapa",
    "info",
    "informasi",
    "daftar",
]

SARCASM_TERMS = [
    "katanya",
    "paling juga",
    "iya paling",
    "mantap sekali sampai",
    "bergizi banget sampai",
    "wkwk",
    "wkwkwk",
    "lucu",
    "ngakak",
    "halu",
    "drama",
]

NEGATION_TERMS = {"tidak", "bukan", "jangan", "belum", "tanpa", "kurang", "ga", "gak"}


def _count_terms(text: str, terms: list[str]) -> tuple[int, list[str]]:
    hits: list[str] = []
    for term in terms:
        if " " in term:
            if term in text:
                hits.append(term)
        elif re.search(rf"\b{re.escape(term)}\b", text):
            hits.append(term)
    return len(hits), hits


def _negation_flips(text: str, terms: list[str]) -> int:
    """Count protected terms immediately preceded by a negation word."""
    tokens = text.split()
    flips = 0
    term_set = {t for t in terms if " " not in t}
    for i, token in enumerate(tokens):
        if token in term_set and i > 0 and tokens[i - 1] in NEGATION_TERMS:
            flips += 1
    return flips


def weak_label(clean_text: str) -> tuple[str, dict[str, int]]:
    """Return a weak sentiment label and the supporting term counts."""
    text = clean_text or ""
    pos, _ = _count_terms(text, POSITIVE_TERMS)
    neg, _ = _count_terms(text, NEGATIVE_TERMS)
    neu, _ = _count_terms(text, NEUTRAL_TERMS)
    sar, _ = _count_terms(text, SARCASM_TERMS)

    # Negated positives shift toward negative and vice versa.
    pos_flips = _negation_flips(text, POSITIVE_TERMS)
    neg_flips = _negation_flips(text, NEGATIVE_TERMS)
    pos_adj = max(pos - pos_flips, 0)
    neg_adj = max(neg - neg_flips, 0) + pos_flips

    counts = {
        "positive": pos_adj,
        "negative": neg_adj,
        "neutral": neu,
        "sarcastic_or_ambiguous": sar,
    }

    # Sarcasm is only asserted when paired with a negative cue, to avoid
    # overstating sarcasm detection.
    if sar >= 1 and neg_adj >= 1:
        return "sarcastic_or_ambiguous", counts
    if pos_adj == 0 and neg_adj == 0:
        if neu >= 1:
            return "neutral", counts
        return "neutral", counts
    if pos_adj > neg_adj:
        return "positive", counts
    if neg_adj > pos_adj:
        return "negative", counts
    return "neutral", counts
