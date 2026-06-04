"""Central configuration for the VoxPop MBG pipeline."""

from __future__ import annotations

SUPPORTED_EXTENSIONS = (".json", ".jsonl", ".csv", ".xlsx")

# Candidate column names used during schema detection. The pipeline does not
# assume a fixed schema; it picks the first candidate that is present and
# populated, and falls back to heuristics when none match.
COMMENT_COLUMN_CANDIDATES = [
    "comment",
    "comments",
    "komentar",
    "text",
    "content",
    "isi_komentar",
    "comment_text",
    "message",
    "caption",
]

DATE_COLUMN_CANDIDATES = [
    "create_time",
    "created_at",
    "date",
    "timestamp",
    "time",
    "tanggal",
    "datetime",
]

ENGAGEMENT_COLUMN_CANDIDATES = [
    "likes",
    "like_count",
    "digg_count",
    "total_reply",
    "reply_count",
    "share_count",
    "favorite_count",
]

IDENTIFIER_COLUMN_CANDIDATES = [
    "username",
    "user",
    "author",
    "nickname",
    "avatar",
    "user_id",
    "uid",
    "uniqueid",
    "video_url",
    "profile_url",
    "comment_id",
    "video_id",
    "parent_comment_id",
]

# Set this when automatic detection cannot identify the comment column.
COMMENT_COLUMN_OVERRIDE: str | None = None

# Public export limits keep the shipped JSON small and reviewable.
MAX_SAMPLE_COMMENTS = 1500
MAX_REPRESENTATIVE_PER_ISSUE = 4
MAX_RISK_COMMENTS = 400
MAX_COMMENT_EXCERPT = 240

# Risk-level thresholds applied to the 0-100 score.
RISK_LOW_MAX = 29
RISK_MEDIUM_MAX = 59
RISK_HIGH_MAX = 79

DATASET_SOURCE = (
    "https://www.kaggle.com/datasets/sinryurifal/"
    "dataset-komentar-tiktok-mbg-makan-bergizi-gratis"
)
PROJECT_NAME = "VoxPop MBG"
LANGUAGE = "id"


def risk_level_for_score(score: float) -> str:
    """Map a 0-100 risk score to a risk level."""
    if score <= RISK_LOW_MAX:
        return "low"
    if score <= RISK_MEDIUM_MAX:
        return "medium"
    if score <= RISK_HIGH_MAX:
        return "high"
    return "needs_verification"
