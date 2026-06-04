import * as React from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SentimentBadge } from "@/components/dashboard/status-badges";
import { getDictionary, issueName } from "@/lib/i18n";
import { formatNumber, formatPercent } from "@/lib/format";
import type { Issue, Locale } from "@/lib/types";

export function IssueTable({
  issues,
  locale,
}: {
  issues: Issue[];
  locale: Locale;
}) {
  const t = getDictionary(locale);
  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="min-w-[160px]">{t.table.issue}</TableHead>
            <TableHead className="text-right">{t.table.comments}</TableHead>
            <TableHead className="hidden text-right sm:table-cell">
              {t.table.share}
            </TableHead>
            <TableHead className="hidden text-right sm:table-cell">
              {t.table.negative}
            </TableHead>
            <TableHead className="hidden md:table-cell">{t.table.dominant}</TableHead>
            <TableHead className="min-w-[120px]">{t.table.severity}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {issues.map((issue) => (
            <TableRow key={issue.issue_id}>
              <TableCell className="font-medium text-foreground">
                {issueName(issue.issue_id, locale, issue.issue_name)}
              </TableCell>
              <TableCell className="text-right tabular-nums text-muted-foreground">
                {formatNumber(issue.count)}
              </TableCell>
              <TableCell className="hidden text-right tabular-nums text-muted-foreground sm:table-cell">
                {formatPercent(issue.share)}
              </TableCell>
              <TableCell className="hidden text-right tabular-nums text-muted-foreground sm:table-cell">
                {formatPercent(issue.negative_share)}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <SentimentBadge sentiment={issue.dominant_sentiment} locale={locale} />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-full max-w-[80px] overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${issue.severity_score}%` }}
                    />
                  </div>
                  <span className="tabular-nums text-xs text-muted-foreground">
                    {issue.severity_score}
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
