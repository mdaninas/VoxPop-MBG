"use client";

import * as React from "react";

export interface TooltipItem {
  name?: React.ReactNode;
  value?: number | string;
  color?: string;
  payload?: Record<string, unknown>;
}

export interface ChartTooltipProps {
  active?: boolean;
  label?: React.ReactNode;
  payload?: TooltipItem[];
  valueFormatter?: (value: number | string) => string;
  hideLabel?: boolean;
}

export function ChartTooltip({
  active,
  label,
  payload,
  valueFormatter,
  hideLabel,
}: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-md border border-border bg-card px-3 py-2 text-xs shadow-lg">
      {!hideLabel && label != null ? (
        <p className="mb-1.5 font-medium text-foreground">{label}</p>
      ) : null}
      <div className="space-y-1">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: entry.color }}
              aria-hidden="true"
            />
            {entry.name ? (
              <span className="text-muted-foreground">{entry.name}</span>
            ) : null}
            <span className="ml-auto pl-3 font-medium text-foreground">
              {entry.value != null && valueFormatter
                ? valueFormatter(entry.value)
                : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
