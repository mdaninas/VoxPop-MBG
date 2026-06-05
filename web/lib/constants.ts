import {
  Home,
  LayoutDashboard,
  SmilePlus,
  Tags,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";

import type { RiskLevel, SentimentLabel } from "./types";

export const SITE = {
  name: "VoxPop MBG",
  subtitle:
    "A full-stack NLP dashboard that analyzes sentiment, public issues, risk signals, and stakeholder recommendations from social media comments.",
  datasetUrl:
    "https://www.kaggle.com/datasets/sinryurifal/dataset-komentar-tiktok-mbg-makan-bergizi-gratis",
  datasetTitle: "Dataset Komentar TikTok MBG (Makan Bergizi Gratis)",
  datasetAuthor: "SinRyuRifal",
  githubUrl: process.env.NEXT_PUBLIC_GITHUB_URL ?? "",
};

export type NavKey =
  | "home"
  | "dashboard"
  | "sentiment"
  | "issues"
  | "risk"
  | "recommendations"
  | "about";

export interface NavItem {
  key: NavKey;
  href: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { key: "home", href: "/", icon: Home },
  { key: "dashboard", href: "/dashboard", icon: LayoutDashboard },
  { key: "sentiment", href: "/sentiment", icon: SmilePlus },
  { key: "issues", href: "/issues", icon: Tags },
  { key: "risk", href: "/risk", icon: ShieldAlert },
];

export const SENTIMENT_META: Record<SentimentLabel, { color: string }> = {
  positive: { color: "#43a85a" },
  negative: { color: "#d9543b" },
  neutral: { color: "#9aa6b4" },
  sarcastic_or_ambiguous: { color: "#c9a24a" },
};

export const SENTIMENT_ORDER: SentimentLabel[] = [
  "positive",
  "negative",
  "neutral",
  "sarcastic_or_ambiguous",
];

export const RISK_META: Record<RiskLevel, { color: string }> = {
  low: { color: "#43a85a" },
  medium: { color: "#c9a24a" },
  high: { color: "#e08a4a" },
  needs_verification: { color: "#d9543b" },
};

export const RISK_ORDER: RiskLevel[] = [
  "low",
  "medium",
  "high",
  "needs_verification",
];

// Warm "heat" scale for issue bars/severity, keyed on negative share.
export function issueBarColor(negativeShare: number): string {
  if (negativeShare >= 0.4) return "#d9543b";
  if (negativeShare >= 0.25) return "#e08a4a";
  if (negativeShare >= 0.12) return "#c9a24a";
  return "#16304a";
}

