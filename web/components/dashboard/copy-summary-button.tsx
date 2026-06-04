"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  getDictionary,
  localize,
  narrativeLabel,
  priorityLabel,
} from "@/lib/i18n";
import type { Locale, Recommendations } from "@/lib/types";

export function CopySummaryButton({
  data,
  locale,
}: {
  data: Recommendations;
  locale: Locale;
}) {
  const t = getDictionary(locale);
  const [copied, setCopied] = React.useState(false);

  function buildText(): string {
    const lines = [
      "VoxPop MBG — " + t.cards.executiveSummary,
      "",
      localize(data.executive_summary, locale),
      "",
      t.recommendations.actionsTitle + ":",
    ];
    for (const action of data.recommended_actions) {
      lines.push(
        `- [${priorityLabel(action.priority, locale)}] ${localize(action.title, locale)}: ${localize(action.description, locale)}`,
      );
      lines.push(`  ${localize(action.evidence, locale)}`);
    }
    lines.push("", t.cards.watchlist + ":");
    for (const code of data.watchlist) lines.push(`- ${narrativeLabel(code, locale)}`);
    lines.push("", t.cards.limitations + ":");
    for (const item of data.limitations) lines.push(`- ${localize(item, locale)}`);
    return lines.join("\n");
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(buildText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleCopy}>
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {copied ? t.common.copied : t.common.copySummary}
    </Button>
  );
}
