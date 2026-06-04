import * as React from "react";
import { Database } from "lucide-react";

import { Card } from "@/components/ui/card";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

export function DataMissing({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  return (
    <Card className="flex flex-col items-center gap-3 p-10 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Database className="h-6 w-6" aria-hidden="true" />
      </span>
      <h2 className="text-lg font-semibold">{t.dataMissing.title}</h2>
      <p className="max-w-md text-sm text-muted-foreground">{t.dataMissing.body}</p>
      <pre className="overflow-x-auto rounded-md border border-border bg-muted/40 p-3 text-left text-xs text-muted-foreground">
        python pipeline/scripts/run_pipeline.py --input data/raw --output web/public/data
      </pre>
    </Card>
  );
}
