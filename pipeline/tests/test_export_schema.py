import json

from voxpop_mbg.export import export_all
from voxpop_mbg.schema import detect_schema


def _make_comments():
    base = [
        ("makanan basi tidak layak", "negative", "food_quality", 38, "medium"),
        ("semoga anak sekolah terbantu", "positive", "student_benefit", 0, "low"),
        ("kapan program ini mulai", "neutral", "question_or_information", 0, "low"),
        ("katanya beracun semua sebarkan", "negative", "food_safety", 65, "high"),
    ]
    comments = []
    for index, (text, sentiment, issue_id, score, level) in enumerate(base * 5):
        comments.append(
            {
                "raw_text": text,
                "clean_text": text,
                "sentiment": sentiment,
                "confidence": 0.8,
                "issue_id": issue_id,
                "issue_name": issue_id.replace("_", " ").title(),
                "issue_keywords": ["makanan"],
                "risk_score": score,
                "risk_level": level,
                "risk_reasons": (
                    [
                        {
                            "type": "food_safety",
                            "term": "beracun",
                            "en": "Contains food safety claim: beracun",
                            "id": "Memuat klaim keamanan pangan: beracun",
                        }
                    ]
                    if score
                    else []
                ),
                "date": "2025-10-01",
            }
        )
    return comments


def _run_export(tmp_path):
    stats = {
        "raw_rows": 30,
        "usable_comments": 20,
        "removed_empty": 6,
        "removed_duplicates": 4,
        "has_timestamp": True,
        "has_engagement": False,
        "date_range": {"start": "2025-10-01", "end": "2025-10-01"},
    }
    export_all(
        output_dir=tmp_path,
        comments=_make_comments(),
        stats=stats,
        sentiment_method="test",
        sentiment_metrics={"method": "test", "accuracy": None},
        sample_limit=50,
        seed=1,
    )


def _load(tmp_path, name):
    return json.loads((tmp_path / name).read_text(encoding="utf-8"))


def test_all_files_written(tmp_path):
    _run_export(tmp_path)
    for name in (
        "overview.json",
        "sentiment_summary.json",
        "issue_summary.json",
        "risk_summary.json",
        "comments_sample.json",
        "recommendations.json",
        "model_metrics.json",
        "analyzer_rules.json",
    ):
        assert (tmp_path / name).exists()


def test_overview_schema(tmp_path):
    _run_export(tmp_path)
    overview = _load(tmp_path, "overview.json")
    for key in ("project_name", "dataset_source", "raw_rows", "usable_comments"):
        assert key in overview


def test_sentiment_distribution_covers_all_labels(tmp_path):
    _run_export(tmp_path)
    summary = _load(tmp_path, "sentiment_summary.json")
    labels = {row["label"] for row in summary["distribution"]}
    assert labels == {"positive", "negative", "neutral", "sarcastic_or_ambiguous"}
    assert "timeline" in summary


def test_comments_sample_is_sanitized(tmp_path):
    _run_export(tmp_path)
    sample = _load(tmp_path, "comments_sample.json")
    assert sample
    first = sample[0]
    for key in ("id", "text", "sentiment", "issue_id", "risk_score", "risk_level"):
        assert key in first
    assert all("username" not in entry for entry in sample)


def test_risk_distribution_levels(tmp_path):
    _run_export(tmp_path)
    risk = _load(tmp_path, "risk_summary.json")
    levels = {row["level"] for row in risk["distribution"]}
    assert levels == {"low", "medium", "high", "needs_verification"}


def test_schema_detection_picks_comment_column():
    records = [
        {"username": "a", "comment": "makanan enak sekali", "create_time": "2025-10-01"},
        {"username": "b", "comment": "kapan mulai program ini", "create_time": "2025-10-02"},
    ]
    schema = detect_schema(records)
    assert schema.comment_column == "comment"
    assert schema.date_column == "create_time"
    assert "username" in schema.identifier_columns
