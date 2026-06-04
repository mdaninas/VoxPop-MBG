"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartTooltip, type TooltipItem } from "./chart-tooltip";
import { EmptyState } from "@/components/ui/empty-state";
import { SENTIMENT_META, SENTIMENT_ORDER } from "@/lib/constants";
import { getDictionary, sentimentLabel } from "@/lib/i18n";
import type { Issue, Locale } from "@/lib/types";

export function SentimentByIssueChart({
  data,
  locale,
}: {
  data: Issue[];
  locale: Locale;
}) {
  const t = getDictionary(locale);
  if (data.length === 0) {
    return <EmptyState title={t.charts.noIssue} />;
  }

  const chartData = data.map((issue) => {
    const total = SENTIMENT_ORDER.reduce(
      (sum, label) => sum + (issue.sentiment_breakdown?.[label] ?? 0),
      0,
    );
    const row: Record<string, number | string> = { issue_name: issue.issue_name };
    for (const label of SENTIMENT_ORDER) {
      const count = issue.sentiment_breakdown?.[label] ?? 0;
      row[label] = total > 0 ? Math.round((count / total) * 1000) / 10 : 0;
    }
    return row;
  });

  const height = Math.max(220, data.length * 40 + 16);

  return (
    <div className="space-y-3">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 0, right: 16, bottom: 0, left: 8 }}
        >
          <XAxis type="number" hide domain={[0, 100]} />
          <YAxis
            type="category"
            dataKey="issue_name"
            width={150}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "hsl(215 20% 65%)", fontSize: 12 }}
          />
          <Tooltip
            cursor={{ fill: "rgba(148,163,184,0.08)" }}
            content={(props) => (
              <ChartTooltip
                active={props.active}
                label={props.label}
                payload={props.payload as unknown as TooltipItem[]}
                valueFormatter={(value) => `${value}%`}
              />
            )}
          />
          {SENTIMENT_ORDER.map((label) => (
            <Bar
              key={label}
              dataKey={label}
              stackId="sentiment"
              fill={SENTIMENT_META[label].color}
              name={sentimentLabel(label, locale)}
              maxBarSize={26}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
      <ul className="flex flex-wrap gap-x-4 gap-y-1.5" aria-hidden="true">
        {SENTIMENT_ORDER.map((label) => (
          <li
            key={label}
            className="flex items-center gap-1.5 text-xs text-muted-foreground"
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: SENTIMENT_META[label].color }}
            />
            {sentimentLabel(label, locale)}
          </li>
        ))}
      </ul>
    </div>
  );
}
