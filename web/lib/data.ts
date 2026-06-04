import { promises as fs } from "fs";
import path from "path";

import type {
  CommentSample,
  IssueSummary,
  ModelMetrics,
  Overview,
  Recommendations,
  RiskSummary,
  SentimentSummary,
} from "./types";

const DATA_DIR = path.join(process.cwd(), "public", "data");

async function readData<T>(name: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, name), "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function getOverview(): Promise<Overview | null> {
  return readData<Overview>("overview.json");
}

export function getSentimentSummary(): Promise<SentimentSummary | null> {
  return readData<SentimentSummary>("sentiment_summary.json");
}

export function getIssueSummary(): Promise<IssueSummary | null> {
  return readData<IssueSummary>("issue_summary.json");
}

export function getRiskSummary(): Promise<RiskSummary | null> {
  return readData<RiskSummary>("risk_summary.json");
}

export function getComments(): Promise<CommentSample[] | null> {
  return readData<CommentSample[]>("comments_sample.json");
}

export function getRecommendations(): Promise<Recommendations | null> {
  return readData<Recommendations>("recommendations.json");
}

export function getModelMetrics(): Promise<ModelMetrics | null> {
  return readData<ModelMetrics>("model_metrics.json");
}
