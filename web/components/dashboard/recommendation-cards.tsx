import * as React from "react";
import { BarChart3, Eye, Lightbulb, ShieldAlert } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getDictionary,
  issueName,
  localize,
  narrativeLabel,
  priorityLabel,
} from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { Locale, RecommendedAction } from "@/lib/types";

const PRIORITY_STYLES: Record<string, string> = {
  High: "bg-[#c9a24a]/20 text-[#8a6d23] border-[#c9a24a]/45",
  Medium: "bg-navy/10 text-navy border-navy/25",
  Low: "bg-[#43a85a]/15 text-[#2f7d43] border-[#43a85a]/40",
};

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
          <Lightbulb className="h-4 w-4 text-primary" aria-hidden="true" />
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

export function RecommendationCard({
  action,
  locale,
}: {
  action: RecommendedAction;
  locale: Locale;
}) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="gap-2">
        <span
          className={cn(
            "w-fit rounded-full border px-2.5 py-0.5 text-xs font-medium",
            PRIORITY_STYLES[action.priority] ?? PRIORITY_STYLES.Low,
          )}
        >
          {priorityLabel(action.priority, locale)}
        </span>
        <CardTitle>{localize(action.title, locale)}</CardTitle>
        <CardDescription className="leading-relaxed">
          {localize(action.description, locale)}
        </CardDescription>
      </CardHeader>
      <CardContent className="mt-auto space-y-3">
        <div className="flex items-start gap-2 rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
          <BarChart3 className="mt-0.5 h-4 w-4 shrink-0 text-navy" aria-hidden="true" />
          <span>{localize(action.evidence, locale)}</span>
        </div>
        {action.linked_issues.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {action.linked_issues.map((issue) => (
              <span
                key={issue}
                className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground"
              >
                {issueName(issue, locale)}
              </span>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function WatchlistCard({
  items,
  locale,
}: {
  items: string[];
  locale: Locale;
}) {
  const t = getDictionary(locale);
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-gold" aria-hidden="true" />
          <CardTitle>{t.cards.watchlist}</CardTitle>
        </div>
        <CardDescription>{t.cards.watchlistSub}</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t.cards.watchlistEmpty}</p>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-sm text-foreground"
              >
                <ShieldAlert
                  className="mt-0.5 h-4 w-4 shrink-0 text-gold"
                  aria-hidden="true"
                />
                {narrativeLabel(item, locale)}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export function LimitationNotice({
  items,
  locale,
}: {
  items: string[];
  locale: Locale;
}) {
  const t = getDictionary(locale);
  return (
    <Card className="border-border/70 bg-muted/20">
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">
          {t.cards.limitations}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {items.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
              {item}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
