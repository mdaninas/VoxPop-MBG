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
import type { Locale } from "@/lib/types";

export interface ClassConfidenceDatum {
  name: string;
  value: number;
  color: string;
}

export function ClassConfidenceChart({
  data,
  locale,
}: {
  data: ClassConfidenceDatum[];
  locale: Locale;
}) {
  const t = getDictionary(locale);
  if (data.length === 0) {
    return <EmptyState title={t.charts.noConfidence} />;
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 0, right: 16, bottom: 0, left: 8 }}
      >
        <XAxis type="number" domain={[0, 100]} hide />
        <YAxis
          type="category"
          dataKey="name"
          width={140}
          tickLine={false}
          axisLine={false}
          tick={{ fill: "hsl(215 13% 47%)", fontSize: 12 }}
        />
        <Tooltip
          cursor={{ fill: "rgba(47,62,81,0.06)" }}
          content={(props) => (
            <ChartTooltip
              active={props.active}
              label={props.label}
              payload={props.payload as unknown as TooltipItem[]}
              valueFormatter={(value) => `${value}%`}
            />
          )}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={26} name={t.sentiment.confidence}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
