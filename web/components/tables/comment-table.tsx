"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

import { RiskBadge, SentimentBadge } from "@/components/dashboard/status-badges";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { RISK_ORDER, SENTIMENT_ORDER } from "@/lib/constants";
import {
  getDictionary,
  issueName,
  riskLabel,
  sentimentLabel,
} from "@/lib/i18n";
import { formatPercent } from "@/lib/format";
import type { CommentSample, Locale } from "@/lib/types";

const PAGE_SIZE = 12;

interface CommentTableProps {
  comments: CommentSample[];
  locale: Locale;
  showRiskReasons?: boolean;
}

export function CommentTable({
  comments,
  locale,
  showRiskReasons,
}: CommentTableProps) {
  const t = getDictionary(locale);
  const [search, setSearch] = React.useState("");
  const [sentiment, setSentiment] = React.useState("all");
  const [issue, setIssue] = React.useState("all");
  const [risk, setRisk] = React.useState("all");
  const [confidence, setConfidence] = React.useState("all");
  const [page, setPage] = React.useState(0);

  const issueOptions = React.useMemo(() => {
    const ids = new Set<string>();
    for (const comment of comments) ids.add(comment.issue_id);
    return [
      { value: "all", label: t.table.allIssues },
      ...Array.from(ids)
        .map((id) => ({ value: id, label: issueName(id, locale) }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    ];
  }, [comments, locale, t.table.allIssues]);

  const filtered = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    const minConfidence = confidence === "all" ? 0 : Number(confidence);
    return comments.filter((comment) => {
      if (query && !comment.text.toLowerCase().includes(query)) return false;
      if (sentiment !== "all" && comment.sentiment !== sentiment) return false;
      if (issue !== "all" && comment.issue_id !== issue) return false;
      if (risk !== "all" && comment.risk_level !== risk) return false;
      if (comment.sentiment_confidence < minConfidence) return false;
      return true;
    });
  }, [comments, search, sentiment, issue, risk, confidence]);

  React.useEffect(() => {
    setPage(0);
  }, [search, sentiment, issue, risk, confidence]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount - 1);
  const rows = filtered.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="relative sm:col-span-2 lg:col-span-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t.table.searchPlaceholder}
            className="pl-9"
            aria-label={t.table.searchPlaceholder}
          />
        </div>
        <Select
          aria-label={t.table.sentiment}
          value={sentiment}
          onChange={(event) => setSentiment(event.target.value)}
          options={[
            { value: "all", label: t.table.allSentiment },
            ...SENTIMENT_ORDER.map((label) => ({
              value: label,
              label: sentimentLabel(label, locale),
            })),
          ]}
        />
        <Select
          aria-label={t.table.issue}
          value={issue}
          onChange={(event) => setIssue(event.target.value)}
          options={issueOptions}
        />
        <Select
          aria-label={t.table.risk}
          value={risk}
          onChange={(event) => setRisk(event.target.value)}
          options={[
            { value: "all", label: t.table.allRisk },
            ...RISK_ORDER.map((level) => ({
              value: level,
              label: riskLabel(level, locale),
            })),
          ]}
        />
        <Select
          aria-label={t.table.confidence}
          value={confidence}
          onChange={(event) => setConfidence(event.target.value)}
          options={[
            { value: "all", label: t.table.anyConfidence },
            { value: "0.7", label: "≥ 70%" },
            { value: "0.8", label: "≥ 80%" },
            { value: "0.9", label: "≥ 90%" },
          ]}
        />
      </div>

      <p className="text-sm text-muted-foreground">
        {filtered.length.toLocaleString()} {t.table.matching}
      </p>

      {rows.length === 0 ? (
        <EmptyState
          title={t.table.noMatchTitle}
          description={t.table.noMatchDesc}
          icon={Search}
        />
      ) : (
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="min-w-[240px]">{t.table.comment}</TableHead>
                <TableHead>{t.table.sentiment}</TableHead>
                <TableHead className="hidden md:table-cell">
                  {t.table.confidence}
                </TableHead>
                <TableHead className="hidden md:table-cell">{t.table.issue}</TableHead>
                <TableHead>{t.table.risk}</TableHead>
                {showRiskReasons ? (
                  <TableHead className="hidden lg:table-cell">
                    {t.table.whyFlagged}
                  </TableHead>
                ) : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((comment) => (
                <TableRow key={comment.id}>
                  <TableCell className="max-w-md align-top">
                    <p className="line-clamp-3 text-foreground">{comment.text}</p>
                  </TableCell>
                  <TableCell className="align-top">
                    <SentimentBadge sentiment={comment.sentiment} locale={locale} />
                  </TableCell>
                  <TableCell className="hidden align-top tabular-nums text-muted-foreground md:table-cell">
                    {formatPercent(comment.sentiment_confidence)}
                  </TableCell>
                  <TableCell className="hidden align-top text-muted-foreground md:table-cell">
                    {issueName(comment.issue_id, locale, comment.issue_name)}
                  </TableCell>
                  <TableCell className="align-top">
                    <div className="flex flex-col gap-1">
                      <RiskBadge level={comment.risk_level} locale={locale} />
                      <span className="text-xs tabular-nums text-muted-foreground">
                        {t.table.score} {comment.risk_score}
                      </span>
                    </div>
                  </TableCell>
                  {showRiskReasons ? (
                    <TableCell className="hidden max-w-xs align-top text-xs text-muted-foreground lg:table-cell">
                      {comment.risk_reasons.length > 0
                        ? comment.risk_reasons.map((reason) => reason[locale]).join("; ")
                        : "-"}
                    </TableCell>
                  ) : null}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {pageCount > 1 ? (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {t.common.page} {current + 1} {t.common.of} {pageCount}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((value) => Math.max(0, value - 1))}
              disabled={current === 0}
              className="inline-flex h-9 items-center gap-1 rounded-md border border-border px-3 text-sm text-foreground transition-colors hover:bg-muted/60 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" /> {t.common.prev}
            </button>
            <button
              type="button"
              onClick={() => setPage((value) => Math.min(pageCount - 1, value + 1))}
              disabled={current >= pageCount - 1}
              className="inline-flex h-9 items-center gap-1 rounded-md border border-border px-3 text-sm text-foreground transition-colors hover:bg-muted/60 disabled:opacity-40"
            >
              {t.common.next} <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
