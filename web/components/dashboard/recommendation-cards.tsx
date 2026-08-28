import * as React from "react";
import { AlertCircle, Lightbulb, ListChecks } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getDictionary, issueName, localize } from "@/lib/i18n";
import type { Locale, Recommendations } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ExecutiveSummaryCard({
  summary,
  footnote,
  locale,
}: {
  summary: string;
  footnote?: string;
  locale: Locale;
}) {
  const t = getDictionary(locale);
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-navy" aria-hidden="true" />
          <CardTitle>{t.cards.executiveSummary}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm leading-relaxed text-foreground">{summary}</p>
        {footnote ? (
          <p className="text-xs text-muted-foreground">{footnote}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function priorityLabel(
  priority: "High" | "Medium" | "Low",
  locale: Locale,
): string {
  const t = getDictionary(locale);
  if (priority === "High") return t.cards.priorityHigh;
  if (priority === "Medium") return t.cards.priorityMedium;
  return t.cards.priorityLow;
}

function priorityClass(priority: "High" | "Medium" | "Low"): string {
  if (priority === "High") return "bg-[#d9543b]/10 text-[#d9543b] border-[#d9543b]/25";
  if (priority === "Medium") return "bg-amber-500/10 text-amber-700 border-amber-500/25";
  return "bg-muted text-muted-foreground border-border";
}

export function RecommendedActionsCard({
  recommendations,
  locale,
}: {
  recommendations: Recommendations;
  locale: Locale;
}) {
  const t = getDictionary(locale);
  const actions = recommendations.recommended_actions ?? [];
  if (actions.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <ListChecks className="h-4 w-4 text-navy" aria-hidden="true" />
          <CardTitle>{t.cards.recommendedActions}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {actions.map((action, index) => (
          <div
            key={`${localize(action.title, locale)}-${index}`}
            className="space-y-2 rounded-lg border border-border bg-muted/20 p-4"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "rounded-md border px-2 py-0.5 text-xs font-medium",
                  priorityClass(action.priority),
                )}
              >
                {priorityLabel(action.priority, locale)}
              </span>
              <h3 className="text-sm font-semibold text-foreground">
                {localize(action.title, locale)}
              </h3>
            </div>
            <p className="text-sm leading-relaxed text-foreground">
              {localize(action.description, locale)}
            </p>
            {action.linked_issues.length > 0 ? (
              <p className="text-xs text-muted-foreground">
                {t.cards.linkedIssues}:{" "}
                {action.linked_issues
                  .map((issueId) => issueName(issueId, locale))
                  .join(", ")}
              </p>
            ) : null}
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground/80">{t.cards.evidence}:</span>{" "}
              {localize(action.evidence, locale)}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function LimitationsCard({
  recommendations,
  locale,
}: {
  recommendations: Recommendations;
  locale: Locale;
}) {
  const t = getDictionary(locale);
  const limitations = recommendations.limitations ?? [];
  if (limitations.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-navy" aria-hidden="true" />
          <CardTitle>{t.cards.limitations}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm leading-relaxed text-foreground">
          {limitations.map((item, index) => (
            <li key={index} className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground" />
              <span>{localize(item, locale)}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
