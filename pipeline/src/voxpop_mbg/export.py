"""Aggregate processed comments into frontend-ready JSON files."""

from __future__ import annotations

import random
import re
from collections import Counter, defaultdict
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any

from .clean import mask_sensitive
from .config import (
    DATASET_SOURCE,
    LANGUAGE,
    MAX_COMMENT_EXCERPT,
    MAX_REPRESENTATIVE_PER_ISSUE,
    MAX_RISK_COMMENTS,
    PROJECT_NAME,
    RISK_HIGH_MAX,
    RISK_LOW_MAX,
    RISK_MEDIUM_MAX,
)
from .label import (
    NEGATION_TERMS,
    NEGATIVE_TERMS,
    NEUTRAL_TERMS,
    POSITIVE_TERMS,
    SARCASM_TERMS,
)
from .normalize import SLANG_DICTIONARY
from .recommend import generate_recommendations
from .risk import (
    ACCUSATION_CUES,
    FOOD_SAFETY_CLAIMS,
    NEUTRAL_QUESTIONS,
    QUESTION_CLAIMS,
    RUMOR_CUES,
    SOURCE_TERMS,
    SUPPORTIVE_TERMS,
    UNIVERSAL_CLAIMS,
    URGENCY_CUES,
    WEIGHTS,
)
from .sentiment import SENTIMENT_LABELS
from .topics import ISSUE_NAMES, ISSUE_TAXONOMY
from .utils import (
    round_share,
    stable_comment_id,
    truncate,
    utc_now_iso,
    write_json,
)

Comment = dict[str, Any]

STOPWORDS = {
    "yang", "untuk", "dengan", "tidak", "ini", "itu", "dari", "dan", "atau",
    "saja", "juga", "akan", "sudah", "masih", "kita", "kami", "mereka", "saya",
    "kamu", "ada", "pada", "dalam", "karena", "biar", "buat", "kalau", "kalo",
    "aja", "nya", "deh", "sih", "kok", "lah", "gak", "tapi", "jadi", "agar",
    "bisa", "mau", "harus", "kan", "ya", "yg", "di", "ke", "the", "dah", "anak",
    "orang", "banget", "udah", "semua", "kayak", "gitu", "gini",
}

# Reason type -> narrative code, in priority order. Display labels are localized
# in the frontend.
NARRATIVE_BY_TYPE = [
    ("food_safety", "food_safety"),
    ("accusation", "corruption"),
    ("rumor", "rumor"),
    ("universal", "universal"),
    ("urgency", "urgency"),
    ("question", "question"),
]

TOKEN_RE = re.compile(r"\b[a-z][a-z']{3,}\b")


def sanitize_for_display(raw_text: str) -> str:
    text = mask_sensitive(raw_text or "")
    text = re.sub(r"\s+", " ", text)
    return truncate(text, MAX_COMMENT_EXCERPT)


def _share_distribution(counter: Counter[str], total: int, keys: list[str], key_name: str) -> list[dict[str, Any]]:
    return [
        {key_name: key, "count": counter.get(key, 0), "share": round_share(counter.get(key, 0), total)}
        for key in keys
    ]


def build_overview(stats: dict[str, Any]) -> dict[str, Any]:
    return {
        "project_name": PROJECT_NAME,
        "dataset_source": DATASET_SOURCE,
        "generated_at": utc_now_iso(),
        "raw_rows": stats["raw_rows"],
        "usable_comments": stats["usable_comments"],
        "removed_empty": stats["removed_empty"],
        "removed_duplicates": stats["removed_duplicates"],
        "language": LANGUAGE,
        "has_timestamp": stats["has_timestamp"],
        "has_engagement": stats["has_engagement"],
        "date_range": stats.get("date_range"),
    }


def _weekly_timeline(comments: list[Comment]) -> list[dict[str, Any]]:
    buckets: dict[str, Counter[str]] = defaultdict(Counter)
    for comment in comments:
        iso_date = comment.get("date")
        if not iso_date:
            continue
        try:
            parsed = datetime.strptime(iso_date, "%Y-%m-%d").date()
        except ValueError:
            continue
        week_start = parsed - timedelta(days=parsed.weekday())
        key = week_start.isoformat()
        buckets[key]["total"] += 1
        buckets[key][comment["sentiment"]] += 1
    timeline = []
    for key in sorted(buckets):
        bucket = buckets[key]
        entry = {"date": key, "total": bucket["total"]}
        for label in SENTIMENT_LABELS:
            entry[label] = bucket.get(label, 0)
        timeline.append(entry)
    return timeline


def build_sentiment_summary(
    comments: list[Comment], method: str, has_timestamp: bool
) -> dict[str, Any]:
    total = len(comments)
    counter = Counter(c["sentiment"] for c in comments)
    avg_conf = (
        round(sum(c["confidence"] for c in comments) / total, 4) if total else 0.0
    )
    summary: dict[str, Any] = {
        "distribution": _share_distribution(counter, total, SENTIMENT_LABELS, "label"),
        "average_confidence": avg_conf,
        "method": method,
        "notes": (
            "Labels are produced from lexicon-based weak labeling. Metrics "
            "describe agreement with those weak labels, not human-reviewed truth."
        ),
    }
    if has_timestamp:
        summary["timeline"] = _weekly_timeline(comments)
    return summary


def _top_keywords(issue_comments: list[Comment]) -> list[str]:
    keyword_counter: Counter[str] = Counter()
    for comment in issue_comments:
        keyword_counter.update(comment.get("issue_keywords", []))
    keywords = [word for word, _ in keyword_counter.most_common(6)]
    if len(keywords) >= 4:
        return keywords[:6]

    token_counter: Counter[str] = Counter()
    for comment in issue_comments:
        for token in TOKEN_RE.findall(comment.get("clean_text", "")):
            if token not in STOPWORDS:
                token_counter[token] += 1
    for word, _ in token_counter.most_common(10):
        if word not in keywords:
            keywords.append(word)
        if len(keywords) >= 6:
            break
    return keywords[:6]


def _representative_comments(
    issue_comments: list[Comment], dominant: str
) -> list[str]:
    preferred = [c for c in issue_comments if c["sentiment"] == dominant]
    pool = preferred or issue_comments
    pool = sorted(pool, key=lambda c: c["confidence"], reverse=True)
    results: list[str] = []
    for comment in pool:
        text = sanitize_for_display(comment["raw_text"])
        if len(text) < 12:
            continue
        if text not in results:
            results.append(text)
        if len(results) >= MAX_REPRESENTATIVE_PER_ISSUE:
            break
    return results


def build_issue_summary(comments: list[Comment]) -> dict[str, Any]:
    total = len(comments)
    grouped: dict[str, list[Comment]] = defaultdict(list)
    for comment in comments:
        grouped[comment["issue_id"]].append(comment)

    raw_severity: dict[str, float] = {}
    for issue_id, group in grouped.items():
        count = len(group)
        share = count / total if total else 0.0
        neg = sum(1 for c in group if c["sentiment"] == "negative") / count
        conf = sum(c["confidence"] for c in group) / count
        raw_severity[issue_id] = share * neg * conf
    max_severity = max(raw_severity.values()) if raw_severity else 0.0

    issues: list[dict[str, Any]] = []
    for issue_id, group in grouped.items():
        count = len(group)
        sentiment_counter = Counter(c["sentiment"] for c in group)
        dominant = sentiment_counter.most_common(1)[0][0]
        negative_share = round_share(sentiment_counter.get("negative", 0), count)
        positive_share = round_share(sentiment_counter.get("positive", 0), count)
        sentiment_breakdown = {
            label: sentiment_counter.get(label, 0) for label in SENTIMENT_LABELS
        }
        severity = (
            round(100 * raw_severity[issue_id] / max_severity)
            if max_severity > 0
            else 0
        )
        issues.append(
            {
                "issue_id": issue_id,
                "issue_name": ISSUE_NAMES.get(issue_id, issue_id),
                "count": count,
                "share": round_share(count, total),
                "dominant_sentiment": dominant,
                "negative_share": negative_share,
                "positive_share": positive_share,
                "sentiment_breakdown": sentiment_breakdown,
                "severity_score": severity,
                "top_keywords": _top_keywords(group),
                "representative_comments": _representative_comments(group, dominant),
            }
        )

    issues.sort(key=lambda i: i["count"], reverse=True)
    return {"issues": issues}


def _narrative_for(reasons: list[dict[str, str]]) -> str | None:
    types = {reason.get("type") for reason in reasons}
    for reason_type, code in NARRATIVE_BY_TYPE:
        if reason_type in types:
            return code
    return None


def build_risk_summary(comments: list[Comment]) -> dict[str, Any]:
    total = len(comments)
    levels = ["low", "medium", "high", "needs_verification"]
    counter = Counter(c["risk_level"] for c in comments)

    flagged = [c for c in comments if c["risk_level"] != "low"]
    narrative_groups: dict[str, list[int]] = defaultdict(list)
    for comment in flagged:
        code = _narrative_for(comment.get("risk_reasons", []))
        if code:
            narrative_groups[code].append(comment["risk_score"])

    narratives = [
        {
            "code": code,
            "count": len(scores),
            "average_risk_score": round(sum(scores) / len(scores)),
        }
        for code, scores in narrative_groups.items()
    ]
    narratives.sort(key=lambda n: n["count"], reverse=True)

    high_count = counter.get("high", 0)
    needs_count = counter.get("needs_verification", 0)
    avg_flagged = (
        round(sum(c["risk_score"] for c in flagged) / len(flagged)) if flagged else 0
    )

    return {
        "distribution": _share_distribution(counter, total, levels, "level"),
        "top_risk_narratives": narratives[:6],
        "total_flagged": len(flagged),
        "high_risk_count": high_count,
        "needs_verification_count": needs_count,
        "average_flagged_risk_score": avg_flagged,
    }


def build_comments_sample(comments: list[Comment], limit: int, seed: int) -> list[dict[str, Any]]:
    high_risk = [c for c in comments if c["risk_level"] in ("high", "needs_verification")]
    high_risk = sorted(high_risk, key=lambda c: c["risk_score"], reverse=True)[:MAX_RISK_COMMENTS]

    rng = random.Random(seed)
    remaining = [c for c in comments if c not in high_risk]
    rng.shuffle(remaining)
    selected = high_risk + remaining
    selected = selected[:limit]
    selected.sort(key=lambda c: c["risk_score"], reverse=True)

    sample: list[dict[str, Any]] = []
    for index, comment in enumerate(selected):
        text = sanitize_for_display(comment["raw_text"])
        if len(text) < 3:
            continue
        entry = {
            "id": stable_comment_id(index + 1),
            "text": text,
            "sentiment": comment["sentiment"],
            "sentiment_confidence": comment["confidence"],
            "issue_id": comment["issue_id"],
            "issue_name": comment["issue_name"],
            "risk_score": comment["risk_score"],
            "risk_level": comment["risk_level"],
            "risk_reasons": comment.get("risk_reasons", []),
        }
        if comment.get("date"):
            entry["date"] = comment["date"]
        sample.append(entry)
    return sample


def build_analyzer_rules() -> dict[str, Any]:
    issues = [
        {
            "id": issue_id,
            "name": str(meta["name"]),
            "keywords": list(meta["keywords"]),  # type: ignore[arg-type]
        }
        for issue_id, meta in ISSUE_TAXONOMY.items()
    ]
    return {
        "slang": dict(SLANG_DICTIONARY),
        "positive_terms": list(POSITIVE_TERMS),
        "negative_terms": list(NEGATIVE_TERMS),
        "neutral_terms": list(NEUTRAL_TERMS),
        "sarcasm_terms": list(SARCASM_TERMS),
        "negation_terms": sorted(NEGATION_TERMS),
        "issues": issues,
        "issue_names": dict(ISSUE_NAMES),
        "food_safety_override": True,
        "risk": {
            "weights": dict(WEIGHTS),
            "rumor_cues": list(RUMOR_CUES),
            "universal_claims": list(UNIVERSAL_CLAIMS),
            "food_safety_claims": list(FOOD_SAFETY_CLAIMS),
            "accusation_cues": list(ACCUSATION_CUES),
            "urgency_cues": list(URGENCY_CUES),
            "question_claims": list(QUESTION_CLAIMS),
            "source_terms": list(SOURCE_TERMS),
            "neutral_questions": list(NEUTRAL_QUESTIONS),
            "supportive_terms": list(SUPPORTIVE_TERMS),
            "thresholds": {
                "low_max": RISK_LOW_MAX,
                "medium_max": RISK_MEDIUM_MAX,
                "high_max": RISK_HIGH_MAX,
            },
        },
    }


def build_model_metrics(sentiment_metrics: dict[str, Any], issue_count: int) -> dict[str, Any]:
    return {
        "sentiment_model": sentiment_metrics,
        "topic_model": {
            "method": "Rule-based taxonomy with optional BERTopic discovery",
            "topic_count": issue_count,
            "notes": "Issue categories are mapped to stakeholder-friendly names.",
        },
        "risk_model": {
            "method": "Transparent rule-based risk scoring",
            "score_range": "0-100",
            "notes": "Risk scores indicate comments requiring manual review.",
        },
    }


def export_all(
    output_dir: Path,
    comments: list[Comment],
    stats: dict[str, Any],
    sentiment_method: str,
    sentiment_metrics: dict[str, Any],
    sample_limit: int,
    seed: int,
) -> dict[str, Any]:
    overview = build_overview(stats)
    sentiment_summary = build_sentiment_summary(
        comments, sentiment_method, stats["has_timestamp"]
    )
    issue_summary = build_issue_summary(comments)
    risk_summary = build_risk_summary(comments)
    comments_sample = build_comments_sample(comments, sample_limit, seed)

    recommendations = generate_recommendations(
        issue_summary["issues"],
        risk_summary["top_risk_narratives"],
    )
    model_metrics = build_model_metrics(
        sentiment_metrics, len(issue_summary["issues"])
    )

    analyzer_rules = build_analyzer_rules()

    files = {
        "overview.json": overview,
        "sentiment_summary.json": sentiment_summary,
        "issue_summary.json": issue_summary,
        "risk_summary.json": risk_summary,
        "comments_sample.json": comments_sample,
        "recommendations.json": recommendations,
        "model_metrics.json": model_metrics,
        "analyzer_rules.json": analyzer_rules,
    }
    for name, payload in files.items():
        write_json(output_dir / name, payload)

    return {
        "files": list(files.keys()),
        "sample_size": len(comments_sample),
        "issue_count": len(issue_summary["issues"]),
    }
