"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { LOCALES } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/types";

export function LanguageToggle({
  locale,
  tone = "dark",
}: {
  locale: Locale;
  tone?: "light" | "dark";
}) {
  const router = useRouter();

  function setLocale(next: Locale) {
    if (next === locale) return;
    document.cookie = `lang=${next};path=/;max-age=31536000;samesite=lax`;
    router.refresh();
  }

  return (
    <div
      role="group"
      aria-label="Language"
      className={cn(
        "inline-flex items-center rounded-full border p-0.5",
        tone === "light" ? "border-white/15 bg-white/5" : "border-border bg-background/60",
      )}
    >
      {LOCALES.map((value) => {
        const selected = locale === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => setLocale(value)}
            aria-pressed={selected}
            className={cn(
              "rounded-full px-2 py-0.5 text-[11px] font-bold uppercase transition-colors",
              selected
                ? tone === "light"
                  ? "bg-gold text-navy"
                  : "bg-primary text-primary-foreground"
                : tone === "light"
                  ? "text-sidebar-muted hover:text-white"
                  : "text-muted-foreground hover:text-foreground",
            )}
          >
            {value}
          </button>
        );
      })}
    </div>
  );
}
