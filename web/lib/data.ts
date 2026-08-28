import { promises as fs } from "fs";
import path from "path";
import { cache } from "react";

import type {
  CommentSample,
  IssueSummary,
  ModelMetrics,
  Overview,
  Recommendations,
  RiskSummary,
  SentimentSummary,
} from "./types";

import issueSummaryData from "../public/data/issue_summary.json";
import modelMetricsData from "../public/data/model_metrics.json";
import overviewData from "../public/data/overview.json";
import recommendationsData from "../public/data/recommendations.json";
import riskSummaryData from "../public/data/risk_summary.json";
import sentimentSummaryData from "../public/data/sentiment_summary.json";

const DATA_DIR = path.join(process.cwd(), "public", "data");

const loadOverview = cache(async (): Promise<Overview | null> => overviewData as Overview);

const loadSentimentSummary = cache(
  async (): Promise<SentimentSummary | null> => sentimentSummaryData as SentimentSummary,
);

const loadIssueSummary = cache(
  async (): Promise<IssueSummary | null> => issueSummaryData as IssueSummary,
);

const loadRiskSummary = cache(
  async (): Promise<RiskSummary | null> => riskSummaryData as RiskSummary,
);

const loadRecommendations = cache(
  async (): Promise<Recommendations | null> => recommendationsData as Recommendations,
);

const loadModelMetrics = cache(
  async (): Promise<ModelMetrics | null> => modelMetricsData as ModelMetrics,
);

const loadComments = cache(async (): Promise<CommentSample[] | null> => {
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, "comments_sample.json"), "utf-8");
    return JSON.parse(raw) as CommentSample[];
  } catch {
    return null;
  }
});

export function getOverview(): Promise<Overview | null> {
  return loadOverview();
}

export function getSentimentSummary(): Promise<SentimentSummary | null> {
  return loadSentimentSummary();
}

export function getIssueSummary(): Promise<IssueSummary | null> {
  return loadIssueSummary();
}

export function getRiskSummary(): Promise<RiskSummary | null> {
  return loadRiskSummary();
}

export function getComments(): Promise<CommentSample[] | null> {
  return loadComments();
}

export function getRecommendations(): Promise<Recommendations | null> {
  return loadRecommendations();
}

export function getModelMetrics(): Promise<ModelMetrics | null> {
  return loadModelMetrics();
}
