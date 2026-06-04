"use client";

import * as React from "react";
import { Menu } from "lucide-react";

import { Brand } from "./brand";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/types";

interface TopbarProps {
  locale: Locale;
  onMenu: () => void;
  className?: string;
}

export function Topbar({ locale, onMenu, className }: TopbarProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-content/90 px-4 backdrop-blur",
        className,
      )}
    >
      <Brand locale={locale} />
      <button
        type="button"
        onClick={onMenu}
        className="rounded-md p-2 text-muted-foreground hover:bg-muted/60"
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </button>
    </header>
  );
}
