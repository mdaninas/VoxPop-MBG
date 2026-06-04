"""Generate small synthetic JSON outputs for development without the dataset.

This produces placeholder data that matches the production schema so the web
app can build and run before the real dataset is processed. Replace the output
by running ``run_pipeline.py`` on the actual Kaggle data.
"""

from __future__ import annotations

import argparse
import random
import sys
from datetime import date, timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from voxpop_mbg.clean import clean_text  # noqa: E402
from voxpop_mbg.export import export_all  # noqa: E402
from voxpop_mbg.label import weak_label  # noqa: E402
from voxpop_mbg.risk import score_comment  # noqa: E402
from voxpop_mbg.topics import assign_issue  # noqa: E402

SAMPLE_COMMENTS = [
    "Semoga program makan bergizi gratis ini benar-benar membantu anak sekolah.",
    "Takut makanannya tidak layak dan basi untuk anak sekolah.",
    "Katanya ada yang keracunan, semua makanannya beracun, tolong sebarkan!",
    "Anggaran triliunan begini transparan tidak ya pengelolaannya?",
    "Kapan program ini mulai di daerah kami yang terpencil?",
    "Menu nya enak dan porsinya cukup, anak saya senang.",
    "Ini cuma pencitraan politik menjelang kampanye saja.",
    "Distribusi belum merata, desa kami belum kebagian sama sekali.",
    "Bagus sekali, semoga gizi anak Indonesia membaik.",
    "Sistemnya ribet dan sering telat, pelaksanaannya kurang rapi.",
    "Siapa saja yang berhak menerima bantuan ini?",
    "Pasti settingan, dananya pasti dikorupsi oknum tertentu.",
    "Alhamdulillah anak terbantu dengan makan siang gratis.",
    "Dapurnya higienis tidak? Pengawasan keamanan pangannya bagaimana?",
    "Mantap sekali sampai banyak yang sakit, lucu ya.",
    "Informasi pendaftarannya di mana ya, butuh info lengkap.",
    "Porsi kecil dan sayurnya sering dingin, kualitas perlu diperbaiki.",
    "Dukung penuh, ini membantu keluarga kurang mampu.",
    "Benarkah anggarannya dipotong di tengah jalan?",
    "Semoga merata sampai pelosok dan tidak pilih kasih.",
    "Programnya membantu tapi pelaksanaannya masih banyak antri.",
    "Racun semua katanya, viralkan biar pemerintah tahu.",
    "Gizi anak penting, terima kasih sudah diperhatikan.",
    "Pajak rakyat dipakai untuk apa kalau tidak transparan?",
]


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate synthetic sample data.")
    parser.add_argument("--output", required=True, help="Directory for exported JSON.")
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()

    rng = random.Random(args.seed)
    start = date(2025, 9, 25)
    comments: list[dict[str, object]] = []
    for index, raw in enumerate(SAMPLE_COMMENTS):
        cleaned = clean_text(raw)
        label, _ = weak_label(cleaned)
        issue_id, issue_name, keywords = assign_issue(cleaned, label)
        risk = score_comment(cleaned)
        comments.append(
            {
                "raw_text": raw,
                "clean_text": cleaned,
                "sentiment": label,
                "confidence": round(0.62 + 0.3 * rng.random(), 4),
                "issue_id": issue_id,
                "issue_name": issue_name,
                "issue_keywords": keywords,
                "risk_score": risk.score,
                "risk_level": risk.level,
                "risk_reasons": risk.reasons,
                "date": (start + timedelta(days=index * 3)).isoformat(),
            }
        )

    stats = {
        "raw_rows": len(comments) + 6,
        "usable_comments": len(comments),
        "removed_empty": 4,
        "removed_duplicates": 2,
        "has_timestamp": True,
        "has_engagement": True,
        "date_range": {"start": comments[0]["date"], "end": comments[-1]["date"]},
    }

    export_all(
        output_dir=Path(args.output),
        comments=comments,
        stats=stats,
        sentiment_method="synthetic_sample",
        sentiment_metrics={
            "method": "Synthetic sample",
            "label_source": "synthetic",
            "evaluation": "none",
            "notes": "Placeholder metrics. Run run_pipeline.py on the dataset.",
        },
        sample_limit=len(comments),
        seed=args.seed,
    )
    print(f"Wrote synthetic sample data to {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
