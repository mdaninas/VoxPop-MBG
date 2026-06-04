"""Run the full VoxPop MBG analysis pipeline and export frontend JSON."""

from __future__ import annotations

import argparse
import sys
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from voxpop_mbg.clean import clean_text, dedupe_key  # noqa: E402
from voxpop_mbg.config import MAX_SAMPLE_COMMENTS  # noqa: E402
from voxpop_mbg.export import export_all  # noqa: E402
from voxpop_mbg.ingest import IngestError, load_records  # noqa: E402
from voxpop_mbg.risk import score_comment  # noqa: E402
from voxpop_mbg.schema import detect_schema  # noqa: E402
from voxpop_mbg.sentiment import run_sentiment  # noqa: E402
from voxpop_mbg.topics import assign_issue  # noqa: E402
from voxpop_mbg.utils import StageTimer, log  # noqa: E402

DATE_FORMATS = (
    "%Y-%m-%d %H:%M:%S",
    "%Y-%m-%dT%H:%M:%S",
    "%Y-%m-%d",
    "%d/%m/%Y",
    "%m/%d/%Y",
)


def parse_date(value: object) -> str | None:
    if value in (None, ""):
        return None
    text = str(value).strip()
    for fmt in DATE_FORMATS:
        try:
            return datetime.strptime(text[: len(fmt) + 4], fmt).date().isoformat()
        except ValueError:
            continue
    try:
        return datetime.fromisoformat(text).date().isoformat()
    except ValueError:
        return None


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run the VoxPop MBG pipeline.")
    parser.add_argument("--input", required=True, help="Raw data directory or file.")
    parser.add_argument("--output", required=True, help="Directory for exported JSON.")
    parser.add_argument("--file", default=None, help="Specific raw file to load.")
    parser.add_argument(
        "--comment-column", default=None, help="Override the detected comment column."
    )
    parser.add_argument(
        "--max-sample", type=int, default=MAX_SAMPLE_COMMENTS, help="Public sample size."
    )
    parser.add_argument("--seed", type=int, default=42)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    input_path = Path(args.input)
    output_path = Path(args.output)

    try:
        with StageTimer("Load raw data"):
            ingest = load_records(input_path, args.file)
    except IngestError as error:
        log(f"ERROR: {error}")
        return 1

    records = ingest.records
    schema = detect_schema(records, args.comment_column)
    if not schema.comment_column:
        log(
            "ERROR: Could not detect a comment column. Set --comment-column or "
            "COMMENT_COLUMN_OVERRIDE in pipeline/src/voxpop_mbg/config.py."
        )
        return 1
    log(f"Comment column: {schema.comment_column}")
    if schema.date_column:
        log(f"Date column: {schema.date_column}")

    with StageTimer("Clean and deduplicate"):
        usable: list[dict[str, object]] = []
        removed_empty = 0
        removed_duplicates = 0
        seen_keys: set[str] = set()
        for record in records:
            raw = str(record.get(schema.comment_column, "") or "").strip()
            if not raw:
                removed_empty += 1
                continue
            cleaned = clean_text(raw)
            key = dedupe_key(cleaned)
            if not cleaned or not key:
                removed_empty += 1
                continue
            if key in seen_keys:
                removed_duplicates += 1
                continue
            seen_keys.add(key)
            iso_date = parse_date(record.get(schema.date_column)) if schema.date_column else None
            usable.append({"raw_text": raw, "clean_text": cleaned, "date": iso_date})

    if not usable:
        log("ERROR: No usable comments after cleaning.")
        return 1

    clean_texts = [c["clean_text"] for c in usable]

    with StageTimer("Sentiment analysis"):
        sentiment = run_sentiment(clean_texts, seed=args.seed)

    with StageTimer("Issue detection and risk scoring"):
        for comment, label, confidence in zip(usable, sentiment.labels, sentiment.confidences):
            comment["sentiment"] = label
            comment["confidence"] = confidence
            issue_id, issue_name, keywords = assign_issue(comment["clean_text"], label)
            comment["issue_id"] = issue_id
            comment["issue_name"] = issue_name
            comment["issue_keywords"] = keywords
            risk = score_comment(comment["clean_text"])
            comment["risk_score"] = risk.score
            comment["risk_level"] = risk.level
            comment["risk_reasons"] = risk.reasons

    dates = [c["date"] for c in usable if c["date"]]
    stats = {
        "raw_rows": ingest.raw_row_count,
        "usable_comments": len(usable),
        "removed_empty": removed_empty,
        "removed_duplicates": removed_duplicates,
        "has_timestamp": bool(dates),
        "has_engagement": bool(schema.engagement_columns),
        "date_range": (
            {"start": min(dates), "end": max(dates)} if dates else None
        ),
    }

    with StageTimer("Export JSON"):
        manifest = export_all(
            output_dir=output_path,
            comments=usable,
            stats=stats,
            sentiment_method=sentiment.method,
            sentiment_metrics=sentiment.metrics,
            sample_limit=args.max_sample,
            seed=args.seed,
        )

    log(
        f"Usable comments: {stats['usable_comments']} | "
        f"removed empty: {removed_empty} | removed duplicates: {removed_duplicates}"
    )
    log(f"Issues: {manifest['issue_count']} | sample size: {manifest['sample_size']}")
    log(f"Wrote {len(manifest['files'])} files to {output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
