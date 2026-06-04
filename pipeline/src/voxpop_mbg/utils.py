"""Shared helpers for IO, logging, and identifiers."""

from __future__ import annotations

import json
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from .config import SUPPORTED_EXTENSIONS


def log(message: str) -> None:
    stamp = datetime.now().strftime("%H:%M:%S")
    print(f"[{stamp}] {message}", file=sys.stderr, flush=True)


class StageTimer:
    """Context manager that logs the duration of a pipeline stage."""

    def __init__(self, name: str) -> None:
        self.name = name

    def __enter__(self) -> "StageTimer":
        self.start = time.perf_counter()
        log(f"-> {self.name}")
        return self

    def __exit__(self, *exc: object) -> None:
        elapsed = time.perf_counter() - self.start
        log(f"   {self.name} done in {elapsed:.2f}s")


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def stable_comment_id(index: int) -> str:
    return f"c_{index:06d}"


def iter_supported_files(directory: Path) -> list[Path]:
    files = [
        path
        for path in sorted(directory.iterdir())
        if path.is_file() and path.suffix.lower() in SUPPORTED_EXTENSIONS
    ]
    return files


def write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as handle:
        json.dump(payload, handle, ensure_ascii=False, indent=2)
        handle.write("\n")


def read_json(path: Path) -> Any:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def round_share(numerator: int, denominator: int, digits: int = 4) -> float:
    if denominator <= 0:
        return 0.0
    return round(numerator / denominator, digits)


def truncate(text: str, limit: int) -> str:
    text = text.strip()
    if len(text) <= limit:
        return text
    return text[: limit - 1].rstrip() + "…"


def safe_int(value: Any) -> int | None:
    try:
        if value is None or value == "":
            return None
        return int(float(str(value).replace(",", "").strip()))
    except (TypeError, ValueError):
        return None
