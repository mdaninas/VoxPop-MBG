# VoxPop MBG

VoxPop MBG reads TikTok comments about Indonesia's Makan Bergizi Gratis (MBG) program and turns them into a dashboard you can actually use. A plain sentiment percentage tells you very little, so instead of stopping there, the app surfaces what people talk about, which topics attract the most negative reactions, and which comments carry rumor or claim patterns that deserve a manual look.

It is built in two parts. A Python pipeline does the language processing offline and writes plain JSON. A Next.js app reads that JSON and renders the dashboard. There is no database and no always-on backend, so the site loads fast and is cheap to host.

## Questions it answers

1. What is the overall public sentiment toward MBG?
2. Which issues come up most often?
3. Which issues are tied to negative sentiment?
4. Which comments look like rumors or unverified claims?
5. What should communicators address first?

## Pages

- **Home**: a short overview of the project.
- **Dashboard**: headline counts, the sentiment split, top issues, and a risk summary.
- **Sentiment**: distribution, average confidence per class, a weekly trend, and a filterable comment table.
- **Issues**: issues ranked by volume, sentiment per issue, and per-issue detail with keywords and example comments.
- **Risk Signals**: the risk distribution, the most common narratives, and a table of flagged comments showing the cues behind each flag.

The interface is bilingual (English and Indonesian) and switches with the toggle in the sidebar. There is also a small in-browser tool that scores a single comment as you type.

## Tech stack

Frontend is Next.js (App Router) with TypeScript, Tailwind CSS, and Recharts. The pipeline is Python with scikit-learn and NumPy. The two sides talk through static JSON files, which keeps the contract between them explicit and easy to inspect.

## Dataset

The analysis uses the Kaggle dataset "Dataset Komentar TikTok MBG (Makan Bergizi Gratis)" by SinRyuRifal:

https://www.kaggle.com/datasets/sinryurifal/dataset-komentar-tiktok-mbg-makan-bergizi-gratis

The raw data is not committed here. Download it and drop the files into `data/raw/` before running the pipeline.

## How the pipeline works

1. Load the raw comments and detect the schema (comment column, timestamp, engagement).
2. Remove empty and duplicate comments, then mask URLs, mentions, emails, and phone-like numbers.
3. Clean and normalize the Indonesian text while keeping negation words and common slang.
4. Label sentiment. Lexicon-based weak labels train a TF-IDF and Logistic Regression model, and the predicted probability is used as a confidence score.
5. Map each comment to an issue category with a curated keyword taxonomy.
6. Score risk from 0 to 100 from transparent lexical cues, then bucket into low, medium, high, and needs verification.
7. Export the aggregated results as JSON for the dashboard.

One point on wording: risk scores flag comments for manual review. They do not decide whether a comment is true or false.

## Project layout

```
data/raw/        Raw dataset (ignored by git)
pipeline/        Python NLP pipeline (modules, scripts, tests)
web/             Next.js dashboard
  app/           Pages: home, dashboard, sentiment, issues, risk
  components/    Layout, charts, tables, UI, demo
  lib/           Types, data loaders, i18n, formatting
  public/data/   Exported JSON read at runtime
```

The pipeline writes seven files into `web/public/data/`: `overview`, `sentiment_summary`, `issue_summary`, `risk_summary`, `comments_sample`, `recommendations`, and `model_metrics`.

## Running it locally

Pipeline:

```bash
cd pipeline
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python scripts/inspect_dataset.py --input ../data/raw
python scripts/run_pipeline.py --input ../data/raw --output ../web/public/data
```

If `data/raw/` holds more than one supported file, add `--file <name>`. If the comment column is not detected automatically, add `--comment-column <name>`. No dataset yet? Run `python scripts/create_sample_data.py --output ../web/public/data` to write small placeholder JSON so the app still builds.

Web app:

```bash
cd web
npm install
npm run dev
```

Then open http://localhost:3000.

## Deploying

The app lives inside the `web/` folder, so it goes to Vercel with one extra setting:

1. Push the repository to GitHub.
2. Import it in Vercel and set **Root Directory** to `web`. Vercel detects Next.js from `web/package.json` on its own.
3. Optional environment variables (see `web/.env.example`):
   - `NEXT_PUBLIC_APP_URL`: the production URL, used for page metadata.
   - `NEXT_PUBLIC_GITHUB_URL`: when set, the home page links to the repo.
4. Deploy.

The JSON under `web/public/data/` is committed, so the site works without the raw dataset. To refresh the numbers, re-run the pipeline and push again.

## Reading the metrics honestly

The dataset has no sentiment labels, so the pipeline uses weak labeling. The accuracy and macro F1 it reports measure how closely the TF-IDF model reproduces those weak labels under cross validation, not agreement with human review. Treat them as a consistency check rather than ground truth.

## Limitations

- The data is a single snapshot and may not represent every MBG conversation.
- Sentiment and issue labels come from weak labels and keyword rules, not human annotation.
- Risk scoring is a review aid, not a verdict.

## Privacy and ethics

Usernames, nicknames, and avatars are removed before anything is exported. Comment excerpts are shortened, and URLs, mentions, emails, and phone numbers are masked. The dashboard shows aggregated patterns and never exposes individual identities. The risk wording is deliberately cautious: a flag means the comment is worth checking, not that it is false.

## Possible next steps

- A FastAPI service so the in-browser analyzer can call the trained model directly.
- A small hand-labeled set for a stronger evaluation.
- Topic discovery with BERTopic to break up the broad "other" bucket.
