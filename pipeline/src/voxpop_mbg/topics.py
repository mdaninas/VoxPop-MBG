"""Issue detection via a curated keyword taxonomy.

The taxonomy maps comments to stakeholder-friendly issue categories. It is the
MVP approach described in the project methodology. Embedding-based topic
discovery (BERTopic) is supported as an optional, documented extension through
``discover_topics`` but is not required for the dashboard.
"""

from __future__ import annotations

import re

# Ordered so that more specific issues are evaluated before broad fallbacks.
ISSUE_TAXONOMY: dict[str, dict[str, object]] = {
    "food_safety": {
        "name": "Food Safety",
        "keywords": [
            "keracunan",
            "racun",
            "beracun",
            "sakit",
            "higienis",
            "kebersihan",
            "dapur",
            "pengawasan",
            "muntah",
            "diare",
            "kuman",
            "basi massal",
            "sppg",
        ],
    },
    "food_quality": {
        "name": "Food Quality",
        "keywords": [
            "makanan",
            "menu",
            "menunya",
            "basi",
            "tidak layak",
            "porsi",
            "lauk",
            "nasi",
            "sayur",
            "rasa",
            "dingin",
            "mentah",
            "kualitas",
            "enak",
            "ayam",
            "susu",
            "telur",
            "tempe",
            "daging",
            "ikan",
            "buah",
            "kacang",
            "burger",
            "masak",
            "goreng",
            "bahan",
        ],
    },
    "budget_transparency": {
        "name": "Budget Transparency",
        "keywords": [
            "anggaran",
            "dana",
            "uang",
            "pajak",
            "triliun",
            "miliar",
            "biaya",
            "korupsi",
            "korup",
            "transparan",
            "settingan",
            "boros",
            "gaji",
        ],
    },
    "distribution_fairness": {
        "name": "Distribution Fairness",
        "keywords": [
            "merata",
            "distribusi",
            "kebagian",
            "jatah",
            "adil",
            "pilih kasih",
            "semua dapat",
        ],
    },
    "regional_access": {
        "name": "Regional Access",
        "keywords": [
            "daerah",
            "desa",
            "pelosok",
            "terpencil",
            "kabupaten",
            "provinsi",
            "kampung",
            "akses",
        ],
    },
    "political_framing": {
        "name": "Political Framing",
        "keywords": [
            "pencitraan",
            "politik",
            "janji",
            "kampanye",
            "presiden",
            "prabowo",
            "pemerintah",
            "negara",
            "rezim",
            "partai",
            "pemilu",
        ],
    },
    "implementation_quality": {
        "name": "Implementation Quality",
        "keywords": [
            "pelaksanaan",
            "sistem",
            "antri",
            "telat",
            "terlambat",
            "ribet",
            "realisasi",
            "berjalan",
            "teknis",
            "tutup",
            "ganti",
        ],
    },
    "eligibility": {
        "name": "Eligibility",
        "keywords": [
            "syarat",
            "berhak",
            "kriteria",
            "kategori",
            "siapa yang dapat",
            "yang berhak",
        ],
    },
    "student_benefit": {
        "name": "Student Benefit",
        "keywords": [
            "anak sekolah",
            "sekolah",
            "siswa",
            "murid",
            "pendidikan",
            "gizi",
            "keluarga",
            "membantu",
            "terbantu",
            "anakku",
            "anak",
        ],
    },
    "question_or_information": {
        "name": "Question or Information",
        "keywords": [
            "kapan",
            "dimana",
            "bagaimana",
            "apakah",
            "berapa",
            "info",
            "informasi",
            "daftar",
        ],
    },
}

ISSUE_NAMES: dict[str, str] = {
    issue_id: str(meta["name"]) for issue_id, meta in ISSUE_TAXONOMY.items()
}
ISSUE_NAMES.update(
    {
        "general_support": "General Support",
        "general_rejection": "General Rejection",
        "other": "Other",
    }
)

ISSUE_NAMES_ID: dict[str, str] = {
    "food_safety": "Keamanan Pangan",
    "food_quality": "Kualitas Makanan",
    "budget_transparency": "Transparansi Anggaran",
    "distribution_fairness": "Pemerataan Distribusi",
    "regional_access": "Akses Daerah",
    "political_framing": "Framing Politik",
    "implementation_quality": "Kualitas Pelaksanaan",
    "eligibility": "Kelayakan Penerima",
    "student_benefit": "Manfaat untuk Siswa",
    "question_or_information": "Pertanyaan / Informasi",
    "general_support": "Dukungan Umum",
    "general_rejection": "Penolakan Umum",
    "other": "Lainnya",
}

ISSUE_ORDER = list(ISSUE_TAXONOMY.keys()) + [
    "general_support",
    "general_rejection",
    "other",
]


def _match_keywords(text: str, keywords: list[str]) -> list[str]:
    matched: list[str] = []
    for keyword in keywords:
        if " " in keyword:
            if keyword in text:
                matched.append(keyword)
        elif re.search(rf"\b{re.escape(keyword)}\b", text):
            matched.append(keyword)
    return matched


def assign_issue(clean_text: str, sentiment: str) -> tuple[str, str, list[str]]:
    """Assign an issue id, display name, and matched keywords to a comment."""
    text = clean_text or ""
    best_issue: str | None = None
    best_hits: list[str] = []
    for issue_id, meta in ISSUE_TAXONOMY.items():
        hits = _match_keywords(text, list(meta["keywords"]))
        if len(hits) > len(best_hits):
            best_hits = hits
            best_issue = issue_id

    if best_issue is not None:
        return best_issue, ISSUE_NAMES[best_issue], best_hits

    if sentiment == "positive":
        fallback = "general_support"
    elif sentiment == "negative":
        fallback = "general_rejection"
    else:
        fallback = "other"
    return fallback, ISSUE_NAMES[fallback], []


def discover_topics(clean_texts: list[str]) -> list[dict[str, object]]:
    """Optional embedding-based topic discovery.

    Returns an empty list when sentence-transformers/BERTopic are not installed,
    keeping the dashboard fully functional on the rule-based taxonomy alone.
    """
    try:
        from bertopic import BERTopic
        from sentence_transformers import SentenceTransformer
    except ImportError:
        return []

    embedder = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")
    model = BERTopic(embedding_model=embedder, calculate_probabilities=False)
    topics, _ = model.fit_transform(clean_texts)
    info = model.get_topic_info()
    discovered: list[dict[str, object]] = []
    for _, row in info.iterrows():
        if row["Topic"] == -1:
            continue
        terms = [word for word, _ in model.get_topic(row["Topic"])][:8]
        discovered.append(
            {
                "topic_id": int(row["Topic"]),
                "count": int(row["Count"]),
                "keywords": terms,
            }
        )
    return discovered
