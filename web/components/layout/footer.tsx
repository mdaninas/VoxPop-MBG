import * as React from "react";

import { SITE } from "@/lib/constants";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

export function Footer({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  return (
    <footer className="border-t border-border px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>{t.footer.tagline}</p>
        <p>
          {t.footer.dataSource}{" "}
          <a
            href={SITE.datasetUrl}
            target="_blank"
            rel="noreferrer"
            className="text-primary hover:underline"
          >
            {SITE.datasetTitle}
          </a>{" "}
          {t.footer.by} {SITE.datasetAuthor}.
        </p>
      </div>
      <p className="mx-auto mt-4 max-w-7xl text-xs text-muted-foreground/70">
        {t.footer.disclaimer}
      </p>
    </footer>
  );
}
