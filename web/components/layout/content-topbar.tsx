"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

import { isActive } from "./sidebar";
import { NAV_ITEMS } from "@/lib/constants";
import { getDictionary } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/types";

export function ContentTopbar({
  locale,
  className,
}: {
  locale: Locale;
  className?: string;
}) {
  const pathname = usePathname();
  const t = getDictionary(locale);
  const current =
    NAV_ITEMS.find((item) => isActive(pathname, item.href)) ?? NAV_ITEMS[0];

  return (
    <div
      className={cn(
        "flex h-14 items-center border-b border-border bg-content/80 px-4 backdrop-blur sm:px-6 lg:px-10",
        className,
      )}
    >
      <span className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
        {t.nav[current.key].label}
      </span>
    </div>
  );
}
