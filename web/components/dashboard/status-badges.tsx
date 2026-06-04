import * as React from "react";

import { SENTIMENT_META, RISK_META } from "@/lib/constants";
import { riskLabel, sentimentLabel } from "@/lib/i18n";
import type { Locale, RiskLevel, SentimentLabel } from "@/lib/types";

function ColoredBadge({ color, label }: { color: string; label: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold text-foreground"
      style={{
        backgroundColor: `${color}1f`,
        borderColor: `${color}55`,
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}

export function SentimentBadge({
  sentiment,
  locale,
}: {
  sentiment: SentimentLabel;
  locale: Locale;
}) {
  return (
    <ColoredBadge
      color={SENTIMENT_META[sentiment].color}
      label={sentimentLabel(sentiment, locale)}
    />
  );
}

export function RiskBadge({
  level,
  locale,
}: {
  level: RiskLevel;
  locale: Locale;
}) {
  return <ColoredBadge color={RISK_META[level].color} label={riskLabel(level, locale)} />;
}
