import * as React from "react";
import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Intent = "default" | "positive" | "negative" | "warning" | "info";

const INTENT_STYLES: Record<Intent, string> = {
  default: "text-muted-foreground bg-muted",
  positive: "text-[#2f7d43] bg-[#43a85a]/15",
  negative: "text-[#b5402a] bg-[#d9543b]/15",
  warning: "text-[#8a6d23] bg-[#c9a24a]/20",
  info: "text-navy bg-navy/10",
};

interface MetricCardProps {
  title: string;
  value: React.ReactNode;
  subtitle?: string;
  icon?: LucideIcon;
  intent?: Intent;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  intent = "default",
}: MetricCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {Icon ? (
          <span
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-md",
              INTENT_STYLES[intent],
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
        ) : null}
      </div>
      <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight">
        {value}
      </p>
      {subtitle ? (
        <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
      ) : null}
    </Card>
  );
}
