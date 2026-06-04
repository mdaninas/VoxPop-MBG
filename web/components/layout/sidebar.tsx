"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Brand } from "./brand";
import { LanguageToggle } from "./language-toggle";
import { NAV_ITEMS, SITE } from "@/lib/constants";
import { getDictionary } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/types";

export function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar({
  locale,
  className,
}: {
  locale: Locale;
  className?: string;
}) {
  const pathname = usePathname();
  const t = getDictionary(locale);

  return (
    <aside
      className={cn(
        "flex w-64 flex-col bg-sidebar text-sidebar-foreground",
        className,
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
        <Brand locale={locale} tone="light" />
        <LanguageToggle locale={locale} tone="light" />
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Primary">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          const nav = t.nav[item.key];
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-colors",
                active
                  ? "bg-[rgba(201,162,74,0.18)] text-white"
                  : "text-sidebar-foreground/85 hover:bg-white/5",
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors",
                  active ? "bg-gold/25 text-gold" : "bg-white/5 text-sidebar-muted",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="flex flex-col">
                <span className="font-semibold leading-tight">{nav.label}</span>
                <span className="text-[11px] font-normal text-sidebar-muted">
                  {nav.description}
                </span>
              </span>
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-4 text-[11px] text-sidebar-muted">
        <p>{t.sidebar.dataLabel}</p>
        <a
          href={SITE.datasetUrl}
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-gold hover:underline"
        >
          {t.sidebar.kaggleDataset}
        </a>
      </div>
    </aside>
  );
}
