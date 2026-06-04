"""Informal Indonesian normalization.

The dictionary intentionally stays small and conservative. It targets common
contractions and negation variants so that downstream keyword matching is
consistent, without aggressively rewriting slang in a way that loses meaning.
"""

from __future__ import annotations

import re

SLANG_DICTIONARY: dict[str, str] = {
    "ga": "tidak",
    "gak": "tidak",
    "nggak": "tidak",
    "ngga": "tidak",
    "gk": "tidak",
    "kga": "tidak",
    "tdk": "tidak",
    "tak": "tidak",
    "yg": "yang",
    "dgn": "dengan",
    "utk": "untuk",
    "untk": "untuk",
    "bgt": "banget",
    "bngt": "banget",
    "jd": "jadi",
    "krn": "karena",
    "karna": "karena",
    "dr": "dari",
    "sm": "sama",
    "aja": "saja",
    "aj": "saja",
    "kalo": "kalau",
    "klo": "kalau",
    "klu": "kalau",
    "duit": "uang",
    "bocil": "anak",
    "pemda": "pemerintah daerah",
    "pemrintah": "pemerintah",
    "anggran": "anggaran",
    "anggaranny": "anggaran",
    "skrg": "sekarang",
    "udh": "sudah",
    "udah": "sudah",
    "blm": "belum",
    "blum": "belum",
    "bs": "bisa",
    "bisa2": "bisa",
    "org": "orang",
    "sklh": "sekolah",
    "sd": "sekolah",
    "anak2": "anak",
    "pd": "pada",
    "trs": "terus",
    "tp": "tapi",
    "tpi": "tapi",
    "kpn": "kapan",
    "gmn": "bagaimana",
    "gimana": "bagaimana",
    "knp": "kenapa",
    "emg": "memang",
    "emang": "memang",
    "bener": "benar",
    "bner": "benar",
    "gizinya": "gizi",
    "mkn": "makan",
    "mkan": "makan",
    "mknan": "makanan",
    "mnu": "menu",
}

_TOKEN_RE = re.compile(r"\b[\w']+\b", flags=re.UNICODE)


def normalize_tokens(text: str) -> str:
    """Replace informal tokens using the slang dictionary."""

    def _replace(match: re.Match[str]) -> str:
        token = match.group(0)
        return SLANG_DICTIONARY.get(token, token)

    return _TOKEN_RE.sub(_replace, text)
