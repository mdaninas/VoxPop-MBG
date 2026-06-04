"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartTooltip, type TooltipItem } from "./chart-tooltip";
import { EmptyState } from "@/components/ui/empty-state";
import { RISK_META } from "@/lib/constants";
import { getDictionary, riskLabel } from "@/lib/i18n";
import { formatNumber } from "@/lib/format";
import type { Locale, RiskDistributionItem } from "@/lib/types";

export function RiskDistributionChart({
  data,
  locale,
}: {
  data: RiskDistributionItem[];
  locale: Locale;
}) {
  const t = getDictionary(locale);
  const total = data.reduce((sum, item) => sum + item.count, 0);
  if (total === 0) {
    return <EmptyState title={t.charts.noRisk} />;
  }

  const chartData = data.map((item) => ({
    name: riskLabel(item.level, locale),
    count: item.count,
    color: RISK_META[item.level].color,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 0, right: 16, bottom: 0, left: 8 }}
      >
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="name"
          width={130}
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
              valueFormatter={(value) => formatNumber(Number(value))}
            />
          )}
        />
        <Bar
          dataKey="count"
          radius={[0, 4, 4, 0]}
          maxBarSize={30}
          name={t.table.comments}
        >
          {chartData.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
