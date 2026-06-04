"""Sentiment classification.

Primary approach: weak labels derived from lexicons train a TF-IDF + Logistic
Regression model. The model generalizes the lexicon signal and yields a
probability used as a confidence score. Cross-validated agreement with the weak
labels is reported as an honest, clearly-scoped metric.

Fallback approach: when scikit-learn is unavailable, the weak labels are used
directly with a margin-based confidence heuristic.
"""

from __future__ import annotations

from collections import Counter
from dataclasses import dataclass, field

from .label import weak_label

SENTIMENT_LABELS = ["positive", "negative", "neutral", "sarcastic_or_ambiguous"]


@dataclass
class SentimentResult:
    labels: list[str]
    confidences: list[float]
    method: str
    metrics: dict[str, object] = field(default_factory=dict)


def _heuristic_confidence(counts: dict[str, int], label: str) -> float:
    ordered = sorted(counts.values(), reverse=True)
    top = ordered[0] if ordered else 0
    second = ordered[1] if len(ordered) > 1 else 0
    if top == 0:
        return 0.5
    margin = top - second
    confidence = 0.55 + 0.1 * top + 0.1 * margin
    return round(min(confidence, 0.95), 4)


def _sklearn_available() -> bool:
    try:
        import sklearn  # noqa: F401

        return True
    except ImportError:
        return False


def _run_with_sklearn(clean_texts: list[str], weak_labels: list[str], seed: int) -> SentimentResult:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.linear_model import LogisticRegression
    from sklearn.metrics import (
        accuracy_score,
        f1_score,
        precision_score,
        recall_score,
    )
    from sklearn.model_selection import StratifiedKFold, cross_val_predict
    from sklearn.pipeline import Pipeline

    model = Pipeline(
        [
            (
                "tfidf",
                TfidfVectorizer(
                    ngram_range=(1, 2),
                    min_df=3,
                    max_features=20000,
                    sublinear_tf=True,
                ),
            ),
            (
                "clf",
                LogisticRegression(
                    max_iter=1000,
                    class_weight="balanced",
                    C=4.0,
                ),
            ),
        ]
    )

    class_counts = Counter(weak_labels)
    smallest = min(class_counts.values())
    metrics: dict[str, object] = {
        "method": "TF-IDF + Logistic Regression",
        "label_source": "weak_labels",
        "evaluation": "cross_validated_agreement_with_weak_labels",
    }

    if smallest >= 5:
        splits = min(5, smallest)
        cv = StratifiedKFold(n_splits=splits, shuffle=True, random_state=seed)
        predicted = cross_val_predict(model, clean_texts, weak_labels, cv=cv)
        metrics.update(
            {
                "accuracy": round(float(accuracy_score(weak_labels, predicted)), 4),
                "macro_f1": round(
                    float(f1_score(weak_labels, predicted, average="macro", zero_division=0)),
                    4,
                ),
                "precision_macro": round(
                    float(
                        precision_score(
                            weak_labels, predicted, average="macro", zero_division=0
                        )
                    ),
                    4,
                ),
                "recall_macro": round(
                    float(
                        recall_score(
                            weak_labels, predicted, average="macro", zero_division=0
                        )
                    ),
                    4,
                ),
                "cv_folds": splits,
            }
        )
    else:
        metrics["notes"] = (
            "A sentiment class had too few weak-labeled examples for "
            "cross-validation; agreement metrics were skipped."
        )

    model.fit(clean_texts, weak_labels)
    probabilities = model.predict_proba(clean_texts)
    classes = list(model.named_steps["clf"].classes_)
    labels: list[str] = []
    confidences: list[float] = []
    for row in probabilities:
        best_index = max(range(len(row)), key=lambda i: row[i])
        labels.append(classes[best_index])
        confidences.append(round(float(row[best_index]), 4))

    return SentimentResult(
        labels=labels,
        confidences=confidences,
        method="tfidf_logistic_regression_with_weak_labels",
        metrics=metrics,
    )


def _run_with_lexicon(clean_texts: list[str], weak_labels: list[str]) -> SentimentResult:
    confidences: list[float] = []
    for text in clean_texts:
        _, counts = weak_label(text)
        label = weak_labels[len(confidences)]
        confidences.append(_heuristic_confidence(counts, label))
    return SentimentResult(
        labels=weak_labels,
        confidences=confidences,
        method="lexicon_weak_labels",
        metrics={
            "method": "Lexicon weak labeling",
            "label_source": "weak_labels",
            "evaluation": "none",
            "notes": (
                "scikit-learn was not available, so lexicon labels are used "
                "directly. Install scikit-learn for the TF-IDF model."
            ),
        },
    )


def run_sentiment(clean_texts: list[str], seed: int = 42) -> SentimentResult:
    weak_labels = [weak_label(text)[0] for text in clean_texts]
    if _sklearn_available() and len(set(weak_labels)) > 1:
        return _run_with_sklearn(clean_texts, weak_labels, seed)
    return _run_with_lexicon(clean_texts, weak_labels)
