// This in-browser demo is required to emit the same labels as the Python pipeline
// for the same text: sentiment, issue_id, and risk score. It is not an approximation.

import type { RiskLevel, SentimentLabel } from "./types";
import rulesJson from "../public/data/analyzer_rules.json";

interface IssueRule {
  id: string;
  name: string;
  keywords: string[];
}

interface AnalyzerRules {
  slang: Record<string, string>;
  positive_terms: string[];
  negative_terms: string[];
  neutral_terms: string[];
  sarcasm_terms: string[];
  negation_terms: string[];
  issues: IssueRule[];
  issue_names: Record<string, string>;
  food_safety_override: boolean;
  risk: {
    weights: Record<string, number>;
    rumor_cues: string[];
    universal_claims: string[];
    food_safety_claims: string[];
    accusation_cues: string[];
    urgency_cues: string[];
    question_claims: string[];
    source_terms: string[];
    neutral_questions: string[];
    supportive_terms: string[];
    thresholds: { low_max: number; medium_max: number; high_max: number };
  };
}

function loadRules(): AnalyzerRules | null {
  try {
    const data = rulesJson as AnalyzerRules;
    if (
      !data?.slang ||
      !Array.isArray(data.positive_terms) ||
      !Array.isArray(data.issues) ||
      !data.risk?.weights ||
      !data.risk?.thresholds
    ) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

const RULES = loadRules();

export interface AnalysisResult {
  sentiment: SentimentLabel;
  confidence: number;
  issueId: string;
  riskScore: number;
  riskLevel: RiskLevel;
  cues: string[];
}

function escapeRegex(term: string): string {
  return term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function matches(text: string, term: string): boolean {
  if (term.includes(" ")) return text.includes(term);
  return new RegExp(`\\b${escapeRegex(term)}\\b`).test(text);
}

function countTerms(text: string, terms: string[]): number {
  return terms.reduce((sum, term) => sum + (matches(text, term) ? 1 : 0), 0);
}

function matchKeywords(text: string, keywords: string[]): string[] {
  const matched: string[] = [];
  for (const keyword of keywords) {
    if (matches(text, keyword)) matched.push(keyword);
  }
  return matched;
}

function findFirst(text: string, terms: string[]): string | null {
  for (const term of terms) {
    if (matches(text, term)) return term;
  }
  return null;
}

function normalizeTokens(text: string, slang: Record<string, string>): string {
  return text.replace(/\b[\w']+\b/gu, (token) => slang[token] ?? token);
}

function clean(rawText: string, slang: Record<string, string>): string {
  let value = rawText.toLowerCase();
  value = value.replace(/https?:\/\/\S+|www\.\S+/gi, " ");
  value = value.replace(/[\w.\-]+@[\w.\-]+\.\w+/g, " ");
  value = value.replace(/@\S+/g, " ");
  value = value.replace(/(?:\+?\d[\s\-]?){8,}\d/g, " ");
  value = value.replace(/#(\w+)/g, "$1");
  value = value.replace(/(.)\1{2,}/g, "$1$1");
  value = value.replace(/([!?.,])\1+/g, "$1");
  value = value.replace(/[^\w\s!?.,'-]/gu, " ");
  value = normalizeTokens(value, slang);
  return value.replace(/\s+/g, " ").trim();
}

function negationFlips(text: string, terms: string[], negations: Set<string>): number {
  const tokens = text.split(" ");
  const unigrams = new Set(terms.filter((term) => !term.includes(" ")));
  let flips = 0;
  for (let i = 0; i < tokens.length; i += 1) {
    if (unigrams.has(tokens[i]) && i > 0 && negations.has(tokens[i - 1])) {
      flips += 1;
    }
  }
  return flips;
}

function weakLabel(
  text: string,
  rules: AnalyzerRules,
): SentimentLabel {
  const pos = countTerms(text, rules.positive_terms);
  const neg = countTerms(text, rules.negative_terms);
  const neu = countTerms(text, rules.neutral_terms);
  const sar = countTerms(text, rules.sarcasm_terms);
  const negations = new Set(rules.negation_terms);

  const posFlips = negationFlips(text, rules.positive_terms, negations);
  const negFlips = negationFlips(text, rules.negative_terms, negations);
  const posAdj = Math.max(pos - posFlips, 0);
  const negAdj = Math.max(neg - negFlips, 0) + posFlips;

  if (sar >= 1 && negAdj >= 1) return "sarcastic_or_ambiguous";
  if (posAdj === 0 && negAdj === 0) return "neutral";
  if (posAdj > negAdj) return "positive";
  if (negAdj > posAdj) return "negative";
  return "neutral";
}

function assignIssue(
  text: string,
  sentiment: SentimentLabel,
  rules: AnalyzerRules,
): string {
  if (rules.food_safety_override) {
    const foodSafety = rules.issues.find((issue) => issue.id === "food_safety");
    if (foodSafety && matchKeywords(text, foodSafety.keywords).length > 0) {
      return "food_safety";
    }
  }

  let bestIssue: string | null = null;
  let bestHits = 0;
  for (const issue of rules.issues) {
    if (issue.id === "food_safety") continue;
    const hitCount = matchKeywords(text, issue.keywords).length;
    if (hitCount > bestHits) {
      bestHits = hitCount;
      bestIssue = issue.id;
    }
  }

  if (bestIssue !== null) return bestIssue;
  if (sentiment === "positive") return "general_support";
  if (sentiment === "negative") return "general_rejection";
  return "other";
}

function riskLevelFor(score: number, thresholds: AnalyzerRules["risk"]["thresholds"]): RiskLevel {
  if (score <= thresholds.low_max) return "low";
  if (score <= thresholds.medium_max) return "medium";
  if (score <= thresholds.high_max) return "high";
  return "needs_verification";
}

function scoreComment(text: string, rules: AnalyzerRules): { score: number; cues: string[] } {
  const { risk } = rules;
  let score = 0;
  const cues: string[] = [];

  const rumor = findFirst(text, risk.rumor_cues);
  if (rumor) {
    score += risk.weights.rumor;
    cues.push("rumor");
  }

  const universal = findFirst(text, risk.universal_claims);
  if (universal) {
    score += risk.weights.universal;
    cues.push("universal");
  }

  const safety = findFirst(text, risk.food_safety_claims);
  if (safety) {
    score += risk.weights.food_safety;
    cues.push("food_safety");
  }

  const accusation = findFirst(text, risk.accusation_cues);
  if (accusation) {
    score += risk.weights.accusation;
    cues.push("accusation");
  }

  const urgency = findFirst(text, risk.urgency_cues);
  if (urgency) {
    score += risk.weights.urgency;
    cues.push("urgency");
  }

  const question = findFirst(text, risk.question_claims);
  if (question) {
    score += risk.weights.question;
    cues.push("question");
  }

  const hasClaim = Boolean(safety || accusation || universal || rumor);
  if (hasClaim && findFirst(text, risk.source_terms) === null) {
    score += risk.weights.lacks_source;
  }

  const neutralQuestion = findFirst(text, risk.neutral_questions);
  if (neutralQuestion && !hasClaim) {
    score += risk.weights.neutral_question;
  }

  const supportive = findFirst(text, risk.supportive_terms);
  if (supportive && !hasClaim) {
    score += risk.weights.supportive;
  }

  score = Math.max(0, Math.min(100, score));
  return { score, cues };
}

function confidenceHeuristic(text: string, rules: AnalyzerRules, sentiment: SentimentLabel): number {
  const pos = countTerms(text, rules.positive_terms);
  const neg = countTerms(text, rules.negative_terms);
  const neu = countTerms(text, rules.neutral_terms);
  const sar = countTerms(text, rules.sarcasm_terms);
  const counts = [pos, neg, neu, sar].sort((a, b) => b - a);
  const top = counts[0];
  const margin = counts[0] - counts[1];
  if (top === 0 && sentiment === "neutral") return 0.5;
  return Math.min(0.55 + 0.1 * top + 0.1 * margin, 0.95);
}

const FALLBACK_RESULT: AnalysisResult = {
  sentiment: "neutral",
  confidence: 0.5,
  issueId: "other",
  riskScore: 0,
  riskLevel: "low",
  cues: [],
};

export function analyzeComment(rawText: string): AnalysisResult {
  if (!RULES) return FALLBACK_RESULT;

  const text = clean(rawText, RULES.slang);
  if (!text) return FALLBACK_RESULT;

  const sentiment = weakLabel(text, RULES);
  const issueId = assignIssue(text, sentiment, RULES);
  const { score, cues } = scoreComment(text, RULES);
  const confidence = confidenceHeuristic(text, RULES, sentiment);

  return {
    sentiment,
    confidence: Math.round(confidence * 100) / 100,
    issueId,
    riskScore: score,
    riskLevel: riskLevelFor(score, RULES.risk.thresholds),
    cues,
  };
}
