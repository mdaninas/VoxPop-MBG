import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <path
        d="M52.16 19.08 A31 31 0 0 1 73.75 69.93"
        stroke="#43a85a"
        strokeWidth="11"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M70.74 73.04 A31 31 0 0 1 23.15 65.50"
        stroke="#c9a24a"
        strokeWidth="11"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M21.26 61.61 A31 31 0 0 1 47.84 19.08"
        stroke="#d9543b"
        strokeWidth="11"
        fill="none"
        strokeLinecap="round"
      />
      <path d="M39 50 C43 41 57 41 61 50 Z" fill="#c9a24a" />
      <path d="M36.5 50 a13.5 11 0 0 0 27 0 Z" fill="#ffffff" />
      <line
        x1="34.5"
        y1="50"
        x2="65.5"
        y2="50"
        stroke="#ffffff"
        strokeWidth="4.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Brand({
  tone = "dark",
  className,
}: {
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <Link href="/" className={cn("flex items-center gap-2.5", className)}>
      <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-navy ring-1 ring-white/10">
        <BrandMark className="h-6 w-6" />
      </span>
      <span
        className={cn(
          "text-base font-bold tracking-tight",
          tone === "light" ? "text-white" : "text-ink",
        )}
      >
        VoxPop MBG
      </span>
    </Link>
  );
}
