"""Schema detection over a list of record dictionaries."""

from __future__ import annotations

from dataclasses import dataclass, field

from .config import (
    COMMENT_COLUMN_CANDIDATES,
    DATE_COLUMN_CANDIDATES,
    ENGAGEMENT_COLUMN_CANDIDATES,
    IDENTIFIER_COLUMN_CANDIDATES,
)
from .utils import safe_int

Record = dict[str, object]


@dataclass
class DatasetSchema:
    columns: list[str]
    row_count: int
    comment_column: str | None
    date_column: str | None
    engagement_columns: list[str] = field(default_factory=list)
    identifier_columns: list[str] = field(default_factory=list)
    missing_counts: dict[str, int] = field(default_factory=dict)


def _collect_columns(records: list[Record]) -> list[str]:
    columns: list[str] = []
    seen: set[str] = set()
    for record in records[:2000]:
        for key in record.keys():
            if key not in seen:
                seen.add(key)
                columns.append(key)
    return columns


def _avg_text_length(records: list[Record], column: str, limit: int = 2000) -> float:
    total = 0
    count = 0
    for record in records[:limit]:
        value = record.get(column)
        if isinstance(value, str) and value.strip():
            total += len(value)
            count += 1
    return total / count if count else 0.0


def _non_empty_ratio(records: list[Record], column: str, limit: int = 2000) -> float:
    sample = records[:limit]
    if not sample:
        return 0.0
    filled = sum(
        1
        for record in sample
        if isinstance(record.get(column), str) and record.get(column).strip()
    )
    return filled / len(sample)


def detect_comment_column(records: list[Record], columns: list[str]) -> str | None:
    lowered = {column.lower(): column for column in columns}
    for candidate in COMMENT_COLUMN_CANDIDATES:
        if candidate in lowered:
            actual = lowered[candidate]
            if _non_empty_ratio(records, actual) > 0.2:
                return actual

    # Heuristic fallback: the textual column with the longest average length.
    best_column: str | None = None
    best_length = 0.0
    for column in columns:
        length = _avg_text_length(records, column)
        if length > best_length and length >= 8:
            best_length = length
            best_column = column
    return best_column


def _detect_simple(columns: list[str], candidates: list[str]) -> str | None:
    lowered = {column.lower(): column for column in columns}
    for candidate in candidates:
        if candidate in lowered:
            return lowered[candidate]
    return None


def _detect_engagement(records: list[Record], columns: list[str]) -> list[str]:
    lowered = {column.lower(): column for column in columns}
    found: list[str] = []
    for candidate in ENGAGEMENT_COLUMN_CANDIDATES:
        if candidate not in lowered:
            continue
        actual = lowered[candidate]
        has_numeric = any(
            safe_int(record.get(actual)) is not None for record in records[:500]
        )
        if has_numeric:
            found.append(actual)
    return found


def _detect_identifiers(columns: list[str]) -> list[str]:
    lowered = {column.lower(): column for column in columns}
    return [lowered[c] for c in IDENTIFIER_COLUMN_CANDIDATES if c in lowered]


def _missing_counts(records: list[Record], columns: list[str]) -> dict[str, int]:
    counts: dict[str, int] = {}
    for column in columns:
        missing = 0
        for record in records:
            value = record.get(column)
            if value is None or (isinstance(value, str) and not value.strip()):
                missing += 1
        counts[column] = missing
    return counts


def detect_schema(records: list[Record], comment_override: str | None = None) -> DatasetSchema:
    columns = _collect_columns(records)
    comment_column = comment_override or detect_comment_column(records, columns)
    return DatasetSchema(
        columns=columns,
        row_count=len(records),
        comment_column=comment_column,
        date_column=_detect_simple(columns, DATE_COLUMN_CANDIDATES),
        engagement_columns=_detect_engagement(records, columns),
        identifier_columns=_detect_identifiers(columns),
        missing_counts=_missing_counts(records, columns),
    )
