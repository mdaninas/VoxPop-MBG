"""Inspect a raw dataset and report detected schema details."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from voxpop_mbg.ingest import IngestError, load_records  # noqa: E402
from voxpop_mbg.schema import detect_schema  # noqa: E402
from voxpop_mbg.utils import truncate  # noqa: E402

SENSITIVE_HINTS = ("user", "name", "avatar", "url", "id", "uid", "profile")


def _is_sensitive(column: str) -> bool:
    lowered = column.lower()
    return any(hint in lowered for hint in SENSITIVE_HINTS)


def mask_record(record: dict[str, object], comment_column: str | None) -> dict[str, object]:
    masked: dict[str, object] = {}
    for key, value in record.items():
        if _is_sensitive(key):
            masked[key] = "***"
        elif key == comment_column and isinstance(value, str):
            masked[key] = truncate(value, 80)
        else:
            text = str(value)
            masked[key] = truncate(text, 80) if len(text) > 80 else value
    return masked


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Inspect a raw dataset.")
    parser.add_argument("--input", required=True, help="Raw data directory or file.")
    parser.add_argument("--file", default=None, help="Specific raw file to inspect.")
    parser.add_argument("--samples", type=int, default=5, help="Sample rows to show.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        ingest = load_records(Path(args.input), args.file)
    except IngestError as error:
        print(f"ERROR: {error}", file=sys.stderr)
        return 1

    records = ingest.records
    schema = detect_schema(records)

    report = {
        "file": ingest.source_file.name,
        "row_count": schema.row_count,
        "structural_duplicates_collapsed": ingest.structural_duplicates,
        "columns": schema.columns,
        "detected_comment_column": schema.comment_column,
        "detected_date_column": schema.date_column,
        "detected_engagement_columns": schema.engagement_columns,
        "detected_identifier_columns": schema.identifier_columns,
        "missing_value_counts": schema.missing_counts,
    }
    print(json.dumps(report, ensure_ascii=False, indent=2))

    print("\nSample rows (sensitive fields masked):")
    for record in records[: args.samples]:
        print(json.dumps(mask_record(record, schema.comment_column), ensure_ascii=False, indent=2))

    if not schema.comment_column:
        print(
            "\nNo comment column detected. Set --comment-column when running the "
            "pipeline, or edit COMMENT_COLUMN_OVERRIDE in config.py.",
            file=sys.stderr,
        )
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
