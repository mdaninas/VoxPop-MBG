import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { SectionHeader } from "@/components/layout/section-header";
import { DataMissing } from "@/components/dashboard/data-missing";
import { SentimentBadge } from "@/components/dashboard/status-badges";
import { IssueBarChart } from "@/components/charts/issue-bar-chart";
import { SentimentByIssueChart } from "@/components/charts/sentiment-by-issue-chart";
import { IssueTable } from "@/components/tables/issue-table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getIssueSummary } from "@/lib/data";
import { getLocale } from "@/lib/locale";
import { getDictionary, interpolate, issueName } from "@/lib/i18n";
import { issueBarColor } from "@/lib/constants";
import { formatNumber, formatPercent } from "@/lib/format";
import type { Issue, Locale } from "@/lib/types";

export const metadata: Metadata = { title: "Issues" };

const FALLBACK_IDS = new Set(["other", "general_support", "general_rejection"]);

function IssueCard({ issue, locale }: { issue: Issue; locale: Locale }) {
  const t = getDictionary(locale);
  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="gap-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle>{issueName(issue.issue_id, locale, issue.issue_name)}</CardTitle>
          <span className="shrink-0 text-right">
            <span className="block text-xs text-muted-foreground">{t.issues.severity}</span>
            <span className="text-lg font-semibold tabular-nums">
              {issue.severity_score}
            </span>
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full"
            style={{
              width: `${issue.severity_score}%`,
              backgroundColor: issueBarColor(issue.negative_share),
            }}
          />
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span>
            {interpolate(t.issues.commentsWithShare, {
              count: formatNumber(issue.count),
              share: formatPercent(issue.share),
            })}
          </span>
          <span>
            {interpolate(t.issues.negativeShare, {
              share: formatPercent(issue.negative_share),
            })}
          </span>
          <SentimentBadge sentiment={issue.dominant_sentiment} locale={locale} />
        </div>
      </CardHeader>
      <CardContent className="mt-auto space-y-3">
        {issue.top_keywords.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {issue.top_keywords.map((keyword) => (
              <span
                key={keyword}
                className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground"
              >
                {keyword}
              </span>
            ))}
          </div>
        ) : null}
        {issue.representative_comments.slice(0, 2).map((comment, index) => (
          <p
            key={index}
            className="rounded-md bg-muted/30 p-2.5 text-xs text-muted-foreground"
          >
            “{comment}”
          </p>
        ))}
      </CardContent>
    </Card>
  );
}

export default async function IssuesPage() {
  const locale = getLocale();
  const t = getDictionary(locale);
  const issueSummary = await getIssueSummary();
  if (!issueSummary) {
    return <DataMissing locale={locale} />;
  }

  const substantive = issueSummary.issues.filter(
    (issue) => issue.issue_id !== "other",
  );
  const topIssues = substantive.slice(0, 8).map((issue) => ({
    issue_name: issueName(issue.issue_id, locale, issue.issue_name),
    count: issue.count,
    share: issue.share,
    color: issueBarColor(issue.negative_share),
  }));
  const byIssue = substantive.slice(0, 8).map((issue) => ({
    ...issue,
    issue_name: issueName(issue.issue_id, locale, issue.issue_name),
  }));
  const cards = issueSummary.issues
    .filter((issue) => !FALLBACK_IDS.has(issue.issue_id))
    .slice(0, 9);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={t.issues.eyebrow}
        title={t.issues.title}
        description={t.issues.description}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t.issues.topByVolume}</CardTitle>
            <p className="text-sm text-muted-foreground">{t.issues.topByVolumeSub}</p>
          </CardHeader>
          <CardContent>
            <IssueBarChart data={topIssues} locale={locale} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t.issues.sentimentByIssue}</CardTitle>
            <p className="text-sm text-muted-foreground">{t.issues.sentimentByIssueSub}</p>
          </CardHeader>
          <CardContent>
            <SentimentByIssueChart data={byIssue} locale={locale} />
          </CardContent>
        </Card>
      </div>

      <section>
        <SectionHeader title={t.issues.detail} description={t.issues.detailSub} />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((issue) => (
            <IssueCard key={issue.issue_id} issue={issue} locale={locale} />
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title={t.issues.allCategories} description={t.issues.allCategoriesSub} />
        <IssueTable issues={issueSummary.issues} locale={locale} />
      </section>
    </div>
  );
}
