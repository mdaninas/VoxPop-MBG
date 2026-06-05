"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";

import { Brand } from "./brand";
import { LanguageToggle } from "./language-toggle";
import { isActive } from "./sidebar";
import { NAV_ITEMS } from "@/lib/constants";
import { getDictionary } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/types";

interface MobileNavProps {
  locale: Locale;
  open: boolean;
  onClose: () => void;
}

export function MobileNav({ locale, open, onClose }: MobileNavProps) {
  const pathname = usePathname();
  const t = getDictionary(locale);

  React.useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    if (open) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="absolute left-0 top-0 flex h-full w-72 max-w-[85%] animate-fade-in flex-col border-r border-border bg-card">
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <Brand />
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-muted-foreground hover:bg-muted/60"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Primary">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {t.nav[item.key].label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-4">
          <LanguageToggle locale={locale} />
        </div>
      </div>
    </div>
  );
}
