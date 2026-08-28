"""Stakeholder recommendation generation.

Recommendations are produced from aggregated metrics using deterministic
templates, so the project runs without any paid API. Display text is emitted in
both English and Indonesian so the dashboard can switch languages.
"""

from __future__ import annotations

from .topics import ISSUE_NAMES, ISSUE_NAMES_ID

ACTION_TEMPLATES: dict[str, dict[str, dict[str, str]]] = {
    "food_quality": {
        "title": {
            "en": "Clarify food quality controls",
            "id": "Perjelas kontrol kualitas makanan",
        },
        "description": {
            "en": "Publish preparation standards, portion guidelines, and reporting channels so quality concerns can be raised and addressed.",
            "id": "Publikasikan standar penyajian, panduan porsi, dan kanal pelaporan agar keluhan kualitas dapat disampaikan dan ditindaklanjuti.",
        },
        "linked_issues": ["food_quality", "food_safety"],
    },
    "food_safety": {
        "title": {
            "en": "Communicate food safety supervision",
            "id": "Komunikasikan pengawasan keamanan pangan",
        },
        "description": {
            "en": "Explain hygiene supervision, kitchen oversight, and how safety incidents are handled and reported.",
            "id": "Jelaskan pengawasan higiene, kontrol dapur, dan cara penanganan serta pelaporan insiden keamanan pangan.",
        },
        "linked_issues": ["food_safety", "food_quality"],
    },
    "budget_transparency": {
        "title": {
            "en": "Improve budget communication",
            "id": "Tingkatkan komunikasi anggaran",
        },
        "description": {
            "en": "Provide simple explanations of budget allocation and oversight mechanisms to reduce uncertainty around program funding.",
            "id": "Berikan penjelasan sederhana tentang alokasi anggaran dan mekanisme pengawasan untuk mengurangi keraguan soal pendanaan program.",
        },
        "linked_issues": ["budget_transparency"],
    },
    "distribution_fairness": {
        "title": {
            "en": "Show distribution coverage",
            "id": "Tunjukkan cakupan distribusi",
        },
        "description": {
            "en": "Share how recipients are selected and how coverage is monitored to address fairness concerns.",
            "id": "Bagikan cara pemilihan penerima dan pemantauan cakupan untuk menjawab keluhan soal pemerataan.",
        },
        "linked_issues": ["distribution_fairness", "regional_access"],
    },
    "regional_access": {
        "title": {
            "en": "Address regional access gaps",
            "id": "Tangani kesenjangan akses daerah",
        },
        "description": {
            "en": "Communicate rollout plans for remote and underserved areas and provide a channel for reporting gaps.",
            "id": "Komunikasikan rencana penyaluran untuk daerah terpencil dan sediakan kanal untuk melaporkan kesenjangan.",
        },
        "linked_issues": ["regional_access", "distribution_fairness"],
    },
    "political_framing": {
        "title": {
            "en": "Separate program facts from framing",
            "id": "Pisahkan fakta program dari framing",
        },
        "description": {
            "en": "Lead with verifiable program facts and outcomes to reduce the space for politicized interpretation.",
            "id": "Utamakan fakta dan hasil program yang dapat diverifikasi untuk mengurangi ruang interpretasi politis.",
        },
        "linked_issues": ["political_framing"],
    },
    "implementation_quality": {
        "title": {
            "en": "Resolve implementation friction",
            "id": "Selesaikan hambatan pelaksanaan",
        },
        "description": {
            "en": "Address logistics issues such as delays and process complexity, and report on improvements.",
            "id": "Tangani masalah logistik seperti keterlambatan dan kerumitan proses, lalu laporkan perbaikannya.",
        },
        "linked_issues": ["implementation_quality"],
    },
    "eligibility": {
        "title": {
            "en": "Clarify eligibility criteria",
            "id": "Perjelas kriteria penerima",
        },
        "description": {
            "en": "Publish clear criteria for who is covered to reduce confusion about participation.",
            "id": "Publikasikan kriteria yang jelas tentang siapa yang berhak untuk mengurangi kebingungan soal partisipasi.",
        },
        "linked_issues": ["eligibility"],
    },
}

PRIORITY_BY_RANK = ["High", "High", "Medium", "Medium", "Low"]

LIMITATIONS = [
    {
        "en": "Results are based on the available Kaggle dataset and may not represent all TikTok users or the wider public.",
        "id": "Hasil didasarkan pada dataset Kaggle yang tersedia dan mungkin tidak mewakili seluruh pengguna TikTok atau masyarakat luas.",
    },
    {
        "en": "Sentiment and issue labels depend on weak labeling and a rule-based taxonomy rather than human-reviewed annotations.",
        "id": "Label sentimen dan isu bergantung pada weak labeling dan taksonomi berbasis aturan, bukan anotasi yang ditinjau manusia.",
    },
    {
        "en": "Risk scoring is an indicator for manual review, not a truth judgment.",
        "id": "Skor risiko adalah indikator untuk peninjauan manual, bukan penilaian benar atau salah.",
    },
]


def _format_share(share: float) -> str:
    return f"{round(share * 100)}%"


def _join(names: list[str]) -> str:
    return ", ".join(names)


def generate_recommendations(
    issues: list[dict[str, object]],
    risk_narratives: list[dict[str, object]],
) -> dict[str, object]:
    actionable = [
        i
        for i in issues
        if i.get("issue_id") in ACTION_TEMPLATES and float(i.get("share", 0.0)) >= 0.01
    ]
    by_severity = sorted(
        actionable,
        key=lambda i: (int(i.get("severity_score", 0)), int(i.get("count", 0))),
        reverse=True,
    )
    by_volume = sorted(actionable, key=lambda i: int(i.get("count", 0)), reverse=True)
    by_negativity = sorted(
        [i for i in actionable if float(i.get("share", 0.0)) >= 0.02],
        key=lambda i: float(i.get("negative_share", 0.0)),
        reverse=True,
    )
    positive_issues = sorted(
        issues,
        key=lambda i: float(i.get("positive_share", 0.0)),
        reverse=True,
    )

    discussed_ids = [str(i["issue_id"]) for i in by_volume[:3]]
    negative_ids = [str(i["issue_id"]) for i in by_negativity[:2]]
    positive_focus_id = next(
        (
            str(i["issue_id"])
            for i in positive_issues
            if float(i.get("positive_share", 0.0)) >= 0.4
            and str(i.get("issue_id")) != "general_support"
        ),
        None,
    )

    def names(ids: list[str], mapping: dict[str, str]) -> str:
        return _join([mapping.get(i, i) for i in ids])

    summary_en = (
        f"Public discussion around MBG is concentrated on "
        f"{names(discussed_ids, ISSUE_NAMES)}."
        if discussed_ids
        else "Public discussion around MBG covers a broad mix of topics."
    )
    summary_id = (
        f"Diskusi publik tentang MBG terkonsentrasi pada "
        f"{names(discussed_ids, ISSUE_NAMES_ID)}."
        if discussed_ids
        else "Diskusi publik tentang MBG mencakup beragam topik."
    )
    if negative_ids:
        summary_en += (
            f" Negative sentiment is most associated with "
            f"{names(negative_ids, ISSUE_NAMES)}."
        )
        summary_id += (
            f" Sentimen negatif paling terkait dengan "
            f"{names(negative_ids, ISSUE_NAMES_ID)}."
        )
    if positive_focus_id:
        summary_en += (
            f" Supportive comments most often highlight "
            f"{ISSUE_NAMES.get(positive_focus_id, positive_focus_id).lower()}."
        )
        summary_id += (
            f" Komentar yang mendukung paling sering menyoroti "
            f"{ISSUE_NAMES_ID.get(positive_focus_id, positive_focus_id).lower()}."
        )

    actions: list[dict[str, object]] = []
    for rank, issue in enumerate(by_severity[:5]):
        issue_id = str(issue["issue_id"])
        template = ACTION_TEMPLATES[issue_id]
        share = _format_share(float(issue.get("share", 0.0)))
        neg = _format_share(float(issue.get("negative_share", 0.0)))
        evidence = {
            "en": (
                f"{ISSUE_NAMES.get(issue_id, issue_id)} appears in {share} of usable "
                f"comments with {neg} negative sentiment."
            ),
            "id": (
                f"{ISSUE_NAMES_ID.get(issue_id, issue_id)} muncul di {share} komentar "
                f"dengan sentimen negatif {neg}."
            ),
        }
        actions.append(
            {
                "priority": PRIORITY_BY_RANK[min(rank, len(PRIORITY_BY_RANK) - 1)],
                "title": template["title"],
                "description": template["description"],
                "linked_issues": template["linked_issues"],
                "evidence": evidence,
            }
        )

    watchlist = [str(n["code"]) for n in risk_narratives[:5]]

    return {
        "executive_summary": {"en": summary_en, "id": summary_id},
        "recommended_actions": actions,
        "watchlist": watchlist,
        "limitations": LIMITATIONS,
    }
