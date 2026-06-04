import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { SectionHeader } from "@/components/layout/section-header";
import { DataMissing } from "@/components/dashboard/data-missing";
import { SentimentDonutChart } from "@/components/charts/sentiment-donut-chart";
import { TrendLineChart } from "@/components/charts/trend-line-chart";
import {
  ClassConfidenceChart,
  type ClassConfidenceDatum,
} from "@/components/charts/class-confidence-chart";
import { CommentTable } from "@/components/tables/comment-table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getComments, getModelMetrics, getSentimentSummary } from "@/lib/data";
import { getLocale } from "@/lib/locale";
import { getDictionary, sentimentLabel } from "@/lib/i18n";
import { SENTIMENT_META, SENTIMENT_ORDER } from "@/lib/constants";
import { formatPercent } from "@/lib/format";
import type { CommentSample, Locale } from "@/lib/types";

export const metadata: Metadata = { title: "Sentiment" };

function buildClassConfidence(
  comments: CommentSample[],
  locale: Locale,
): ClassConfidenceDatum[] {
  const result: ClassConfidenceDatum[] = [];
  for (const label of SENTIMENT_ORDER) {
    const subset = comments.filter((comment) => comment.sentiment === label);
    if (subset.length === 0) continue;
    const avg =
      subset.reduce((sum, comment) => sum + comment.sentiment_confidence, 0) /
      subset.length;
    result.push({
      name: sentimentLabel(label, locale),
      value: Math.round(avg * 1000) / 10,
      color: SENTIMENT_META[label].color,
    });
  }
  return result;
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-2 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums">{value}</span>
    </div>
  );
}

function formatMetric(value: unknown, notEvaluated: string): string {
  if (value === null || value === undefined) return notEvaluated;
  if (typeof value === "number") {
    return value <= 1 && value > 0 ? formatPercent(value, 1) : String(value);
  }
  return String(value);
}

export default async function SentimentPage() {
  const locale = getLocale();
  const t = getDictionary(locale);
  const [sentiment, comments, metrics] = await Promise.all([
    getSentimentSummary(),
    getComments(),
    getModelMetrics(),
  ]);

  if (!sentiment) {
    return <DataMissing locale={locale} />;
  }

  const model = (metrics?.sentiment_model ?? {}) as Record<string, unknown>;
  const na = t.sentiment.notEvaluated;
  const classConfidence = comments ? buildClassConfidence(comments, locale) : [];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={t.sentiment.eyebrow}
        title={t.sentiment.title}
        description={t.sentiment.description}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t.sentiment.distribution}</CardTitle>
          </CardHeader>
          <CardContent>
            <SentimentDonutChart data={sentiment.distribution} locale={locale} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t.sentiment.confidence}</CardTitle>
            <p className="text-sm text-muted-foreground">{t.sentiment.confidenceSub}</p>
          </CardHeader>
          <CardContent>
            <ClassConfidenceChart data={classConfidence} locale={locale} />
          </CardContent>
        </Card>
      </div>

      {sentiment.timeline && sentiment.timeline.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>{t.sentiment.overTime}</CardTitle>
            <p className="text-sm text-muted-foreground">{t.sentiment.overTimeSub}</p>
          </CardHeader>
          <CardContent>
            <TrendLineChart data={sentiment.timeline} locale={locale} />
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{t.sentiment.modelMetrics}</CardTitle>
        </CardHeader>
        <CardContent>
          <MetricRow label={t.sentiment.metricMethod} value={formatMetric(model.method, na)} />
          <MetricRow
            label={t.sentiment.metricLabelSource}
            value={formatMetric(model.label_source, na)}
          />
          <MetricRow label={t.sentiment.metricAccuracy} value={formatMetric(model.accuracy, na)} />
          <MetricRow label={t.sentiment.metricMacroF1} value={formatMetric(model.macro_f1, na)} />
          <MetricRow
            label={t.sentiment.metricPrecision}
            value={formatMetric(model.precision_macro, na)}
          />
          <MetricRow
            label={t.sentiment.metricRecall}
            value={formatMetric(model.recall_macro, na)}
          />
          <p className="mt-3 text-xs text-muted-foreground">{t.sentiment.metricNote}</p>
        </CardContent>
      </Card>

      <section>
        <SectionHeader title={t.sentiment.explorer} description={t.sentiment.explorerSub} />
        {comments && comments.length > 0 ? (
          <CommentTable comments={comments} locale={locale} />
        ) : (
          <DataMissing locale={locale} />
        )}
      </section>
    </div>
  );
}
