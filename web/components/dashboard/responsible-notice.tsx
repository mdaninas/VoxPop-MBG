import * as React from "react";
import { ShieldCheck } from "lucide-react";

import { getDictionary } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/types";

export function ResponsibleNotice({
  locale,
  variant = "info",
  className,
}: {
  locale: Locale;
  variant?: "info" | "danger";
  className?: string;
}) {
  const danger = variant === "danger";
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border p-4 text-sm",
        danger
          ? "border-[#d9543b]/35 bg-[#d9543b]/[0.07]"
          : "border-navy/20 bg-navy/[0.04]",
        className,
      )}
    >
      <ShieldCheck
        className={cn(
          "mt-0.5 h-5 w-5 shrink-0",
          danger ? "text-terracotta" : "text-navy",
        )}
        aria-hidden="true"
      />
      <p className="text-foreground/80">{getDictionary(locale).responsibleNotice}</p>
    </div>
  );
}
