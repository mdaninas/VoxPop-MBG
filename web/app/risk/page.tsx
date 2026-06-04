import type { Metadata } from "next";
import { AlertTriangle, Flag, ShieldAlert, Gauge } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { SectionHeader } from "@/components/layout/section-header";
import { MetricCard } from "@/components/dashboard/metric-card";
import { ResponsibleNotice } from "@/components/dashboard/responsible-notice";
import { DataMissing } from "@/components/dashboard/data-missing";
import { RiskDistributionChart } from "@/components/charts/risk-distribution-chart";
import { RiskCommentTable } from "@/components/tables/risk-comment-table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getComments, getRiskSummary } from "@/lib/data";
import { getLocale } from "@/lib/locale";
import { getDictionary, narrativeLabel } from "@/lib/i18n";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Risk Signals" };

export default async function RiskPage() {
  const locale = getLocale();
  const t = getDictionary(locale);
  const [risk, comments] = await Promise.all([getRiskSummary(), getComments()]);

  if (!risk) {
    return <DataMissing locale={locale} />;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={t.risk.eyebrow}
        title={t.risk.title}
        description={t.risk.description}
      />

      <ResponsibleNotice locale={locale} variant="danger" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title={t.risk.flaggedComments}
          value={formatNumber(risk.total_flagged)}
          subtitle={t.risk.flaggedCommentsSub}
          icon={Flag}
          intent="warning"
        />
        <MetricCard
          title={t.risk.highRisk}
          value={formatNumber(risk.high_risk_count)}
          subtitle={t.risk.highRiskSub}
          icon={ShieldAlert}
          intent="warning"
        />
        <MetricCard
          title={t.risk.needsVerification}
          value={formatNumber(risk.needs_verification_count)}
          subtitle={t.risk.needsVerificationSub}
          icon={AlertTriangle}
          intent="negative"
        />
        <MetricCard
          title={t.risk.avgFlagged}
          value={formatNumber(risk.average_flagged_risk_score)}
          subtitle={t.risk.avgFlaggedSub}
          icon={Gauge}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t.risk.distribution}</CardTitle>
            <p className="text-sm text-muted-foreground">{t.risk.distributionSub}</p>
          </CardHeader>
          <CardContent>
            <RiskDistributionChart data={risk.distribution} locale={locale} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t.risk.narratives}</CardTitle>
            <p className="text-sm text-muted-foreground">{t.risk.narrativesSub}</p>
          </CardHeader>
          <CardContent>
            {risk.top_risk_narratives.length === 0 ? (
              <EmptyState title={t.risk.noNarratives} />
            ) : (
              <ul className="space-y-3">
                {risk.top_risk_narratives.map((narrative, index) => (
                  <li
                    key={narrative.code}
                    className={cn(
                      "flex items-center justify-between gap-4 rounded-lg border p-3",
                      index < 2
                        ? "border-[#d9543b]/35 bg-[#d9543b]/[0.06]"
                        : "border-border bg-muted/20",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <AlertTriangle
                        className="h-4 w-4 shrink-0 text-ember"
                        aria-hidden="true"
                      />
                      <span className="text-sm text-foreground">
                        {narrativeLabel(narrative.code, locale)}
                      </span>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold tabular-nums">
                        {formatNumber(narrative.count)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t.risk.avg} {narrative.average_risk_score}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <section>
        <SectionHeader title={t.risk.explorer} description={t.risk.explorerSub} />
        {comments && comments.length > 0 ? (
          <RiskCommentTable comments={comments} locale={locale} />
        ) : (
          <EmptyState title={t.risk.noSample} />
        )}
      </section>
    </div>
  );
}
