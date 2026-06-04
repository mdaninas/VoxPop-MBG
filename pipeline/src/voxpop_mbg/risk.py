"""Transparent risk-signal scoring.

The score is an additive 0-100 indicator built from auditable lexical cues. It
flags comments that may warrant manual review. It does not judge whether a
comment is true or false.
"""

from __future__ import annotations

import re
from dataclasses import dataclass

from .config import risk_level_for_score

RUMOR_CUES = ["katanya", "kabarnya", "denger denger", "denger-denger", "konon", "dengar dengar"]
UNIVERSAL_CLAIMS = ["semua", "pasti", "selalu", "tidak ada satupun", "semuanya", "seluruh"]
FOOD_SAFETY_CLAIMS = ["racun", "keracunan", "beracun", "basi massal", "basi", "muntah", "diare"]
ACCUSATION_CUES = ["korupsi", "settingan", "pencitraan", "dibayar", "proyek", "dikorupsi"]
URGENCY_CUES = ["viral", "sebarkan", "jangan diam", "tolong viralkan", "share"]
QUESTION_CLAIMS = ["apakah benar", "beneran", "bener gak", "benarkah", "masa sih"]
SOURCE_TERMS = ["sumber", "menurut", "berita", "link", "video", "data", "laporan"]
NEUTRAL_QUESTIONS = ["kapan mulai", "siapa dapat", "kapan", "dimana daftar", "berapa"]
SUPPORTIVE_TERMS = ["semoga", "bagus", "membantu", "bermanfaat", "terima kasih", "mantap"]

WEIGHTS = {
    "rumor": 20,
    "universal": 15,
    "food_safety": 25,
    "accusation": 15,
    "urgency": 10,
    "lacks_source": 10,
    "question": 5,
    "neutral_question": -10,
    "supportive": -10,
}


RiskReason = dict[str, str]


@dataclass
class RiskResult:
    score: int
    level: str
    reasons: list[RiskReason]


# Bilingual templates for each cue type. {term} is filled when a term is matched.
REASON_TEXT: dict[str, dict[str, str]] = {
    "rumor": {"en": "Contains rumor cue: {term}", "id": "Memuat indikasi rumor: {term}"},
    "universal": {"en": "Uses universal claim: {term}", "id": "Memuat klaim general: {term}"},
    "food_safety": {
        "en": "Contains food safety claim: {term}",
        "id": "Memuat klaim keamanan pangan: {term}",
    },
    "accusation": {
        "en": "Contains accusation cue: {term}",
        "id": "Memuat indikasi tuduhan: {term}",
    },
    "urgency": {
        "en": "Contains urgency cue: {term}",
        "id": "Memuat ajakan menyebarkan: {term}",
    },
    "question": {
        "en": "Phrased as a claim-style question: {term}",
        "id": "Berupa pertanyaan bernada klaim: {term}",
    },
    "lacks_source": {
        "en": "Claim-like statement without a cited source",
        "id": "Pernyataan berisi klaim tanpa sumber",
    },
    "neutral_question": {
        "en": "Neutral factual question",
        "id": "Pertanyaan faktual netral",
    },
    "supportive": {
        "en": "Supportive, non-claim language",
        "id": "Bahasa mendukung, bukan klaim",
    },
}


def _reason(reason_type: str, term: str | None = None) -> RiskReason:
    text = REASON_TEXT[reason_type]
    return {
        "type": reason_type,
        "term": term or "",
        "en": text["en"].format(term=term),
        "id": text["id"].format(term=term),
    }


def _find(text: str, terms: list[str]) -> str | None:
    for term in terms:
        if " " in term:
            if term in text:
                return term
        elif re.search(rf"\b{re.escape(term)}\b", text):
            return term
    return None


def score_comment(clean_text: str) -> RiskResult:
    text = clean_text or ""
    score = 0
    reasons: list[RiskReason] = []

    rumor = _find(text, RUMOR_CUES)
    if rumor:
        score += WEIGHTS["rumor"]
        reasons.append(_reason("rumor", rumor))

    universal = _find(text, UNIVERSAL_CLAIMS)
    if universal:
        score += WEIGHTS["universal"]
        reasons.append(_reason("universal", universal))

    safety = _find(text, FOOD_SAFETY_CLAIMS)
    if safety:
        score += WEIGHTS["food_safety"]
        reasons.append(_reason("food_safety", safety))

    accusation = _find(text, ACCUSATION_CUES)
    if accusation:
        score += WEIGHTS["accusation"]
        reasons.append(_reason("accusation", accusation))

    urgency = _find(text, URGENCY_CUES)
    if urgency:
        score += WEIGHTS["urgency"]
        reasons.append(_reason("urgency", urgency))

    question = _find(text, QUESTION_CLAIMS)
    if question:
        score += WEIGHTS["question"]
        reasons.append(_reason("question", question))

    has_claim = bool(safety or accusation or universal or rumor)
    if has_claim and _find(text, SOURCE_TERMS) is None:
        score += WEIGHTS["lacks_source"]
        reasons.append(_reason("lacks_source"))

    neutral_question = _find(text, NEUTRAL_QUESTIONS)
    if neutral_question and not has_claim:
        score += WEIGHTS["neutral_question"]
        reasons.append(_reason("neutral_question"))

    supportive = _find(text, SUPPORTIVE_TERMS)
    if supportive and not has_claim:
        score += WEIGHTS["supportive"]
        reasons.append(_reason("supportive"))

    score = max(0, min(100, score))
    return RiskResult(score=score, level=risk_level_for_score(score), reasons=reasons)
