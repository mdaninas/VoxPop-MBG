import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { SectionHeader } from "@/components/layout/section-header";
import { DataMissing } from "@/components/dashboard/data-missing";
import { CopySummaryButton } from "@/components/dashboard/copy-summary-button";
import {
  ExecutiveSummaryCard,
  LimitationNotice,
  RecommendationCard,
  WatchlistCard,
} from "@/components/dashboard/recommendation-cards";
import { getRecommendations } from "@/lib/data";
import { getLocale } from "@/lib/locale";
import { getDictionary, localize } from "@/lib/i18n";

export const metadata: Metadata = { title: "Recommendations" };

export default async function RecommendationsPage() {
  const locale = getLocale();
  const t = getDictionary(locale);
  const recommendations = await getRecommendations();
  if (!recommendations) {
    return <DataMissing locale={locale} />;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={t.recommendations.eyebrow}
        title={t.recommendations.title}
        description={t.recommendations.description}
        actions={<CopySummaryButton data={recommendations} locale={locale} />}
      />

      <ExecutiveSummaryCard
        locale={locale}
        summary={localize(recommendations.executive_summary, locale)}
      />

      <section>
        <SectionHeader
          title={t.recommendations.actionsTitle}
          description={t.recommendations.actionsSub}
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recommendations.recommended_actions.map((action) => (
            <RecommendationCard
              key={localize(action.title, "en")}
              action={action}
              locale={locale}
            />
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <WatchlistCard items={recommendations.watchlist} locale={locale} />
        <LimitationNotice
          items={recommendations.limitations.map((item) => localize(item, locale))}
          locale={locale}
        />
      </div>
    </div>
  );
}
