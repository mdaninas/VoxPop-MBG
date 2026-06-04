# VoxPop MBG Pipeline

The pipeline turns raw TikTok comment data into the sanitized JSON files the web
dashboard reads. It detects the dataset schema, cleans and normalizes Indonesian
text, assigns sentiment, issue categories, and risk signals, and exports
aggregated results.

## Requirements

- Python 3.10 or newer
- The dependencies listed in `requirements.txt`

## Setup

```bash
cd pipeline
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

The pipeline runs without `scikit-learn` by falling back to lexicon-based
labeling, but installing it enables the TF-IDF + Logistic Regression model.

## Dataset

Download the dataset and place the file(s) in `../data/raw/`:

- Dataset Komentar TikTok MBG (Makan Bergizi Gratis):
  https://www.kaggle.com/datasets/sinryurifal/dataset-komentar-tiktok-mbg-makan-bergizi-gratis

Supported formats: `.json`, `.jsonl`, `.csv`, `.xlsx`. When `data/raw/` contains
more than one supported file, pass `--file` to choose one.

## Inspect the dataset

```bash
python scripts/inspect_dataset.py --input ../data/raw
```

This prints the detected comment, date, and engagement columns, missing-value
counts, and a few sample rows with sensitive fields masked.

## Run the pipeline

```bash
python scripts/run_pipeline.py --input ../data/raw --output ../web/public/data
```

If the comment column cannot be detected automatically, pass it explicitly:

```bash
python scripts/run_pipeline.py --input ../data/raw --output ../web/public/data --comment-column comment
```

Other options: `--file` (specific input file), `--max-sample` (public sample
size), `--seed`.

## Generate placeholder data (no dataset required)

```bash
python scripts/create_sample_data.py --output ../web/public/data
```

This writes small synthetic JSON files that match the production schema so the
web app can build before the real dataset is processed.

## Output files

Written to the `--output` directory:

| File | Contents |
|---|---|
| `overview.json` | Row counts, cleaning stats, dataset metadata |
| `sentiment_summary.json` | Sentiment distribution, confidence, weekly timeline |
| `issue_summary.json` | Issue categories with keywords and representative comments |
| `risk_summary.json` | Risk-level distribution and top risk narratives |
| `comments_sample.json` | Sanitized sample of comments for the explorer |
| `recommendations.json` | Executive summary, recommended actions, watchlist |
| `model_metrics.json` | Method descriptions and evaluation metrics |

## Methodology

- **Cleaning**: lowercasing, URL/mention/phone/email masking, repeated-character
  and punctuation normalization, and a small informal-Indonesian dictionary.
  Negation words are preserved. Raw and cleaned text are both kept internally.
- **Deduplication**: rows that repeat the same identifier are collapsed, then
  exact duplicate comments are removed after normalization.
- **Sentiment**: lexicon-based weak labels train a TF-IDF + Logistic Regression
  classifier; the predicted probability is used as a confidence score. Reported
  metrics describe cross-validated agreement with the weak labels, not
  human-reviewed accuracy.
- **Issues**: a curated keyword taxonomy maps comments to stakeholder-friendly
  categories. Embedding-based topic discovery (BERTopic) is available as an
  optional extension.
- **Risk**: a transparent additive 0-100 score built from auditable lexical
  cues. It flags comments for manual review and does not judge truthfulness.

## Tests

```bash
pip install pytest
pytest
```

## Configuration

Defaults live in `src/voxpop_mbg/config.py`, including candidate column names,
export limits, risk thresholds, and `COMMENT_COLUMN_OVERRIDE` for datasets whose
comment column cannot be detected automatically.
