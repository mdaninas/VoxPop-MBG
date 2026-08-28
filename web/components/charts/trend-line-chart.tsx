"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartTooltip, type TooltipItem } from "./chart-tooltip";
import { EmptyState } from "@/components/ui/empty-state";
import { SENTIMENT_META, SENTIMENT_ORDER } from "@/lib/constants";
import { getDictionary, sentimentLabel } from "@/lib/i18n";
import { formatCompact, formatDate, formatNumber } from "@/lib/format";
import type { Locale, TimelinePoint } from "@/lib/types";

export function TrendLineChart({
  data,
  locale,
}: {
  data: TimelinePoint[];
  locale: Locale;
}) {
  if (!data || data.length === 0) {
    return <EmptyState title={getDictionary(locale).charts.noTimeline} />;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
        <defs>
          {SENTIMENT_ORDER.map((label) => (
            <linearGradient
              key={label}
              id={`grad-${label}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor={SENTIMENT_META[label].color}
                stopOpacity={0.5}
              />
              <stop
                offset="100%"
                stopColor={SENTIMENT_META[label].color}
                stopOpacity={0.05}
              />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={(value) => formatDate(value, locale)}
          tickLine={false}
          axisLine={false}
          minTickGap={28}
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
        />
        <YAxis
          tickFormatter={(value) => formatCompact(Number(value), locale)}
          tickLine={false}
          axisLine={false}
          width={40}
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
        />
        <Tooltip
          content={(props) => (
            <ChartTooltip
              active={props.active}
              label={props.label ? formatDate(String(props.label), locale) : undefined}
              payload={props.payload as unknown as TooltipItem[]}
              valueFormatter={(value) => formatNumber(Number(value), locale)}
            />
          )}
        />
        {SENTIMENT_ORDER.map((label) => (
          <Area
            key={label}
            type="monotone"
            dataKey={label}
            stackId="sentiment"
            stroke={SENTIMENT_META[label].color}
            fill={`url(#grad-${label})`}
            name={sentimentLabel(label, locale)}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
