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
import { getDictionary } from "@/lib/i18n";
import { formatNumber } from "@/lib/format";
import type { Locale } from "@/lib/types";

export interface IssueBarDatum {
  issue_name: string;
  count: number;
  share: number;
  color?: string;
}

export function IssueBarChart({
  data,
  locale,
}: {
  data: IssueBarDatum[];
  locale: Locale;
}) {
  const t = getDictionary(locale);
  if (data.length === 0) {
    return <EmptyState title={t.charts.noIssue} />;
  }

  const height = Math.max(220, data.length * 40 + 16);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 0, right: 16, bottom: 0, left: 8 }}
      >
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="issue_name"
          width={150}
          tickLine={false}
          axisLine={false}
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
        />
        <Tooltip
          cursor={{ fill: "rgba(148,163,184,0.08)" }}
          content={(props) => (
            <ChartTooltip
              active={props.active}
              label={props.label}
              payload={props.payload as unknown as TooltipItem[]}
              valueFormatter={(value) => formatNumber(Number(value), locale)}
            />
          )}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={26} name={t.table.comments}>
          {data.map((entry) => (
            <Cell key={entry.issue_name} fill={entry.color ?? "#16304a"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
