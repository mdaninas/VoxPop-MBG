"use client";

import * as React from "react";

import { ContentTopbar } from "./content-topbar";
import { Footer } from "./footer";
import { MobileNav } from "./mobile-nav";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import type { Locale } from "@/lib/types";

export function AppShell({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="min-h-screen">
      <Sidebar locale={locale} className="fixed inset-y-0 left-0 z-40 hidden lg:flex" />
      <div className="flex min-h-screen flex-col bg-content lg:pl-64">
        <Topbar locale={locale} className="lg:hidden" onMenu={() => setOpen(true)} />
        <ContentTopbar locale={locale} className="hidden lg:flex" />
        <main className="flex-1">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
            {children}
          </div>
        </main>
        <Footer locale={locale} />
      </div>
      <MobileNav locale={locale} open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
