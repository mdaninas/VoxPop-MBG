"use client";

import * as React from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { ChartTooltip, type TooltipItem } from "./chart-tooltip";
import { EmptyState } from "@/components/ui/empty-state";
import { SENTIMENT_META } from "@/lib/constants";
import { getDictionary, sentimentLabel } from "@/lib/i18n";
import { formatNumber, formatPercent } from "@/lib/format";
import type { Locale, SentimentDistributionItem } from "@/lib/types";

export function SentimentDonutChart({
  data,
  locale,
}: {
  data: SentimentDistributionItem[];
  locale: Locale;
}) {
  const t = getDictionary(locale);
  const total = data.reduce((sum, item) => sum + item.count, 0);
  if (total === 0) {
    return <EmptyState title={t.charts.noSentiment} />;
  }

  const chartData = data.map((item) => ({
    name: sentimentLabel(item.label, locale),
    value: item.count,
    share: item.share,
    color: SENTIMENT_META[item.label].color,
  }));

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="relative h-[220px] w-full sm:w-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={62}
              outerRadius={92}
              paddingAngle={2}
              strokeWidth={0}
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={(props) => (
                <ChartTooltip
                  active={props.active}
                  payload={props.payload as unknown as TooltipItem[]}
                  hideLabel
                  valueFormatter={(value) => formatNumber(Number(value), locale)}
                />
              )}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold">{formatNumber(total, locale)}</span>
          <span className="text-xs text-muted-foreground">{t.charts.commentsUnit}</span>
        </div>
      </div>
      <ul className="flex-1 space-y-2" aria-label={t.dashboard.sentimentDistribution}>
        {chartData.map((entry) => (
          <li key={entry.name} className="flex items-center gap-2 text-sm">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: entry.color }}
              aria-hidden="true"
            />
            <span className="text-foreground">{entry.name}</span>
            <span className="ml-auto tabular-nums text-muted-foreground">
              {formatNumber(entry.value, locale)} ({formatPercent(entry.share, locale)})
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
