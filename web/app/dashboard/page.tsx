import type { Metadata } from "next";
import {
  CheckCircle2,
  Layers,
  MessagesSquare,
  ShieldAlert,
} from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { MetricCard } from "@/components/dashboard/metric-card";
import { ExecutiveSummaryCard } from "@/components/dashboard/recommendation-cards";
import { ResponsibleNotice } from "@/components/dashboard/responsible-notice";
import { DataMissing } from "@/components/dashboard/data-missing";
import { RiskBadge, SentimentBadge } from "@/components/dashboard/status-badges";
import { CommentAnalyzer } from "@/components/demo/comment-analyzer";
import { SentimentDonutChart } from "@/components/charts/sentiment-donut-chart";
import { IssueBarChart } from "@/components/charts/issue-bar-chart";
import { RiskDistributionChart } from "@/components/charts/risk-distribution-chart";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getComments,
  getIssueSummary,
  getOverview,
  getRecommendations,
  getRiskSummary,
  getSentimentSummary,
} from "@/lib/data";
import { getLocale } from "@/lib/locale";
import { getDictionary, interpolate, issueName, localize } from "@/lib/i18n";
import { issueBarColor } from "@/lib/constants";
import { formatDate, formatNumber, formatPercent } from "@/lib/format";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const locale = getLocale();
  const t = getDictionary(locale);
  const [overview, sentiment, issues, risk, recommendations, comments] =
    await Promise.all([
      getOverview(),
      getSentimentSummary(),
      getIssueSummary(),
      getRiskSummary(),
      getRecommendations(),
      getComments(),
    ]);

  if (!overview || !sentiment || !issues || !risk) {
    return <DataMissing locale={locale} />;
  }

  const removed = overview.removed_empty + overview.removed_duplicates;
  const range = overview.date_range
    ? `, ${formatDate(overview.date_range.start)} – ${formatDate(overview.date_range.end)}`
    : "";
  const topIssues = issues.issues
    .filter((issue) => issue.issue_id !== "other")
    .slice(0, 7)
    .map((issue) => ({
      issue_name: issueName(issue.issue_id, locale, issue.issue_name),
      count: issue.count,
      share: issue.share,
      color: issueBarColor(issue.negative_share),
    }));

  const representative = (comments ?? [])
    .filter((comment) => comment.text.length > 40)
    .sort((a, b) => b.sentiment_confidence - a.sentiment_confidence)
    .slice(0, 4);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={t.dashboard.eyebrow}
        title={t.dashboard.title}
        description={interpolate(t.dashboard.description, {
          count: formatNumber(overview.usable_comments),
          range,
        })}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title={t.dashboard.metricTotal}
          value={formatNumber(overview.raw_rows)}
          subtitle={t.dashboard.metricTotalSub}
          icon={MessagesSquare}
          intent="info"
        />
        <MetricCard
          title={t.dashboard.metricUsable}
          value={formatNumber(overview.usable_comments)}
          subtitle={t.dashboard.metricUsableSub}
          icon={CheckCircle2}
          intent="positive"
        />
        <MetricCard
          title={t.dashboard.metricRemoved}
          value={formatNumber(removed)}
          subtitle={interpolate(t.dashboard.metricRemovedSub, {
            empty: formatNumber(overview.removed_empty),
            dup: formatNumber(overview.removed_duplicates),
          })}
          icon={Layers}
        />
        <MetricCard
          title={t.dashboard.metricFlagged}
          value={formatNumber(risk.total_flagged)}
          subtitle={interpolate(t.dashboard.metricFlaggedSub, {
            pct: formatPercent(risk.total_flagged / overview.usable_comments),
          })}
          icon={ShieldAlert}
          intent="warning"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t.dashboard.sentimentDistribution}</CardTitle>
          </CardHeader>
          <CardContent>
            <SentimentDonutChart data={sentiment.distribution} locale={locale} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t.dashboard.topIssues}</CardTitle>
          </CardHeader>
          <CardContent>
            <IssueBarChart data={topIssues} locale={locale} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t.dashboard.riskSignals}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <RiskDistributionChart data={risk.distribution} locale={locale} />
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-md bg-muted/40 p-3">
                <p className="text-lg font-semibold tabular-nums">
                  {formatNumber(risk.total_flagged)}
                </p>
                <p className="text-xs text-muted-foreground">{t.dashboard.flagged}</p>
              </div>
              <div className="rounded-md bg-muted/40 p-3">
                <p className="text-lg font-semibold tabular-nums">
                  {formatNumber(risk.high_risk_count)}
                </p>
                <p className="text-xs text-muted-foreground">{t.dashboard.highRisk}</p>
              </div>
              <div className="rounded-md bg-muted/40 p-3">
                <p className="text-lg font-semibold tabular-nums">
                  {formatNumber(risk.average_flagged_risk_score)}
                </p>
                <p className="text-xs text-muted-foreground">{t.dashboard.avgScore}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        {recommendations ? (
          <ExecutiveSummaryCard
            locale={locale}
            summary={localize(recommendations.executive_summary, locale)}
            footnote={`${t.dashboard.method}: ${String(sentiment.method)}. ${t.dashboard.avgConfidence} ${formatPercent(sentiment.average_confidence)}.`}
          />
        ) : null}
      </div>

      {representative.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>{t.dashboard.representative}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {representative.map((comment) => (
              <div
                key={comment.id}
                className="flex flex-col gap-2 rounded-lg border border-border bg-muted/20 p-4"
              >
                <p className="text-sm text-foreground">{comment.text}</p>
                <div className="mt-auto flex flex-wrap items-center gap-2">
                  <SentimentBadge sentiment={comment.sentiment} locale={locale} />
                  <span className="text-xs text-muted-foreground">
                    {issueName(comment.issue_id, locale, comment.issue_name)}
                  </span>
                  <span className="ml-auto">
                    <RiskBadge level={comment.risk_level} locale={locale} />
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <CommentAnalyzer locale={locale} />

      <ResponsibleNotice locale={locale} />

      <p className="text-xs text-muted-foreground">{t.dashboard.methodologyNote}</p>
    </div>
  );
}
