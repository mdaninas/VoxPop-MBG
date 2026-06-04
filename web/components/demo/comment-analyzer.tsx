"use client";

import * as React from "react";
import { Sparkles, Wand2 } from "lucide-react";

import { RiskBadge, SentimentBadge } from "@/components/dashboard/status-badges";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RISK_META } from "@/lib/constants";
import {
  getDictionary,
  interpolate,
  issueName,
  riskCueLabel,
} from "@/lib/i18n";
import { formatPercent } from "@/lib/format";
import { analyzeComment, type AnalysisResult } from "@/lib/analyzer";
import type { Locale } from "@/lib/types";

const MAX_LENGTH = 500;

const EXAMPLES = [
  "Semoga menu MBG bergizi dan benar-benar membantu anak sekolah.",
  "Katanya semua makanannya beracun, tolong sebarkan!",
  "Anggaran triliunan begini transparan tidak pengelolaannya?",
];

function RiskGauge({ score, color }: { score: number; color: string }) {
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const fraction = Math.max(0, Math.min(100, score)) / 100;
  return (
    <svg viewBox="0 0 40 40" className="h-11 w-11 -rotate-90" aria-hidden="true">
      <circle cx="20" cy="20" r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="5" />
      <circle
        cx="20"
        cy="20"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={`${circumference * fraction} ${circumference}`}
      />
    </svg>
  );
}

export function CommentAnalyzer({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const [text, setText] = React.useState("");
  const [result, setResult] = React.useState<AnalysisResult | null>(null);

  function handleAnalyze() {
    const trimmed = text.trim();
    if (!trimmed) {
      setResult(null);
      return;
    }
    setResult(analyzeComment(trimmed.slice(0, MAX_LENGTH)));
  }

  function explanation(value: AnalysisResult): string {
    if (value.riskLevel === "low" || value.cues.length === 0) {
      return t.demo.explanationLow;
    }
    return interpolate(t.demo.explanationFlagged, {
      cues: value.cues.map((cue) => riskCueLabel(cue, locale)).join(", "),
    });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-navy" aria-hidden="true" />
            <CardTitle>{t.demo.title}</CardTitle>
          </div>
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            in-browser demo
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{t.demo.description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="demo-input" className="sr-only">
            {t.demo.title}
          </label>
          <textarea
            id="demo-input"
            value={text}
            onChange={(event) => setText(event.target.value.slice(0, MAX_LENGTH))}
            rows={3}
            placeholder={t.demo.placeholder}
            className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {text.length}/{MAX_LENGTH}
            </span>
            <Button onClick={handleAnalyze} size="sm" disabled={!text.trim()}>
              <Sparkles className="h-4 w-4" /> {t.demo.analyze}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => {
                setText(example);
                setResult(analyzeComment(example));
              }}
              className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
            >
              {example.length > 42 ? `${example.slice(0, 42)}…` : example}
            </button>
          ))}
        </div>

        {result ? (
          <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
            <div className="flex flex-wrap items-center gap-4">
              <SentimentBadge sentiment={result.sentiment} locale={locale} />
              <span className="rounded-full border border-border bg-card px-2.5 py-0.5 text-xs font-medium text-foreground">
                {issueName(result.issueId, locale)}
              </span>
              <span className="text-xs text-muted-foreground">
                {t.demo.confidence}: {formatPercent(result.confidence)}
              </span>
              <div className="ml-auto flex items-center gap-2">
                <RiskGauge score={result.riskScore} color={RISK_META[result.riskLevel].color} />
                <div className="flex flex-col">
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    {t.demo.risk}
                  </span>
                  <span className="text-lg font-bold leading-none tabular-nums">
                    {result.riskScore}
                  </span>
                </div>
                <RiskBadge level={result.riskLevel} locale={locale} />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{explanation(result)}</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
