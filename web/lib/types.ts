export type Locale = "id" | "en";

export interface LocalizedString {
  en: string;
  id: string;
}

export type SentimentLabel =
  | "positive"
  | "negative"
  | "neutral"
  | "sarcastic_or_ambiguous";

export type RiskLevel = "low" | "medium" | "high" | "needs_verification";

export interface RiskReason {
  type: string;
  term: string;
  en: string;
  id: string;
}

export interface DateRange {
  start: string;
  end: string;
}

export interface Overview {
  project_name: string;
  dataset_source: string;
  generated_at: string;
  raw_rows: number;
  usable_comments: number;
  removed_empty: number;
  removed_duplicates: number;
  language: string;
  has_timestamp: boolean;
  has_engagement: boolean;
  date_range: DateRange | null;
}

export interface SentimentDistributionItem {
  label: SentimentLabel;
  count: number;
  share: number;
}

export interface TimelinePoint {
  date: string;
  total: number;
  positive: number;
  negative: number;
  neutral: number;
  sarcastic_or_ambiguous: number;
}

export interface SentimentSummary {
  distribution: SentimentDistributionItem[];
  average_confidence: number;
  method: string;
  notes: string;
  timeline?: TimelinePoint[];
}

export interface Issue {
  issue_id: string;
  issue_name: string;
  count: number;
  share: number;
  dominant_sentiment: SentimentLabel;
  negative_share: number;
  positive_share: number;
  sentiment_breakdown: Record<SentimentLabel, number>;
  severity_score: number;
  top_keywords: string[];
  representative_comments: string[];
}

export interface IssueSummary {
  issues: Issue[];
}

export interface RiskDistributionItem {
  level: RiskLevel;
  count: number;
  share: number;
}

export interface RiskNarrative {
  code: string;
  count: number;
  average_risk_score: number;
}

export interface RiskSummary {
  distribution: RiskDistributionItem[];
  top_risk_narratives: RiskNarrative[];
  total_flagged: number;
  high_risk_count: number;
  needs_verification_count: number;
  average_flagged_risk_score: number;
}

export interface CommentSample {
  id: string;
  text: string;
  sentiment: SentimentLabel;
  sentiment_confidence: number;
  issue_id: string;
  issue_name: string;
  risk_score: number;
  risk_level: RiskLevel;
  risk_reasons: RiskReason[];
  date?: string;
}

export interface RecommendedAction {
  priority: "High" | "Medium" | "Low";
  title: LocalizedString;
  description: LocalizedString;
  linked_issues: string[];
  evidence: LocalizedString;
}

export interface Recommendations {
  executive_summary: LocalizedString;
  recommended_actions: RecommendedAction[];
  watchlist: string[];
  limitations: LocalizedString[];
}

export interface ModelMetrics {
  sentiment_model: Record<string, unknown>;
  topic_model: Record<string, unknown>;
  risk_model: Record<string, unknown>;
}

export interface AnalyzerIssueRule {
  id: string;
  name: string;
  keywords: string[];
}

export interface AnalyzerRiskThresholds {
  low_max: number;
  medium_max: number;
  high_max: number;
}

export interface AnalyzerRiskRules {
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
  thresholds: AnalyzerRiskThresholds;
}

export interface AnalyzerRules {
  slang: Record<string, string>;
  positive_terms: string[];
  negative_terms: string[];
  neutral_terms: string[];
  sarcasm_terms: string[];
  negation_terms: string[];
  issues: AnalyzerIssueRule[];
  issue_names: Record<string, string>;
  food_safety_override: boolean;
  risk: AnalyzerRiskRules;
}
