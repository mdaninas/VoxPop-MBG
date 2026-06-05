import * as React from "react";
import { Lightbulb } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

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
