import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getOverview } from "@/lib/data";
import { getLocale } from "@/lib/locale";
import { getDictionary, interpolate } from "@/lib/i18n";
import { SITE } from "@/lib/constants";
import { formatDate, formatNumber } from "@/lib/format";

export const metadata: Metadata = { title: "About" };

const RISK_WEIGHTS = ["+25", "+20", "+15", "+15", "+10", "+10", "+5", "−10"];

const TECH = [
  "Next.js (App Router)",
  "TypeScript",
  "Tailwind CSS",
  "Recharts",
  "lucide-react",
  "Python",
  "scikit-learn",
  "NumPy",
];

export default async function AboutPage() {
  const locale = getLocale();
  const t = getDictionary(locale);
  const overview = await getOverview();
  const range = overview?.date_range
    ? ` (${formatDate(overview.date_range.start)} – ${formatDate(overview.date_range.end)})`
    : "";

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={t.about.eyebrow}
        title={t.about.title}
        description={t.about.description}
      />

      <Card>
        <CardHeader>
          <CardTitle>{t.about.datasetTitle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            {interpolate(t.about.datasetIntro, {
              title: SITE.datasetTitle,
              author: SITE.datasetAuthor,
            })}
          </p>
          <a
            href={SITE.datasetUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-primary hover:underline"
          >
            {t.common.viewOnKaggle} <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <p>{t.about.datasetRaw}</p>
          {overview ? (
            <p>
              {interpolate(t.about.datasetBuild, {
                count: formatNumber(overview.usable_comments),
                range,
              })}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t.about.pipelineTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2 text-sm">
              {t.about.pipelineStages.map((stage, index) => (
                <li key={stage} className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                    {index + 1}
                  </span>
                  <span className="text-foreground">{stage}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.about.methodTitle}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div>
              <p className="font-medium text-foreground">{t.about.methodSentimentTitle}</p>
              <p>{t.about.methodSentiment}</p>
            </div>
            <div>
              <p className="font-medium text-foreground">{t.about.methodIssuesTitle}</p>
              <p>{t.about.methodIssues}</p>
            </div>
            <div>
              <p className="font-medium text-foreground">{t.about.methodRiskTitle}</p>
              <p>{t.about.methodRisk}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t.about.riskTitle}</CardTitle>
          <p className="text-sm text-muted-foreground">{t.about.riskSub}</p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>{t.about.riskFeature}</TableHead>
                <TableHead className="hidden sm:table-cell">{t.about.riskExample}</TableHead>
                <TableHead className="text-right">{t.about.riskWeight}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {t.about.riskFeatures.map((row, index) => (
                <TableRow key={row.feature}>
                  <TableCell className="font-medium text-foreground">
                    {row.feature}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">
                    {row.example}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {RISK_WEIGHTS[index]}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t.about.limitationsTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {t.about.limitations.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t.about.ethicsTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {t.about.ethics.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t.about.techTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {TECH.map((item) => (
              <span
                key={item}
                className="rounded-full border border-border bg-muted/30 px-3 py-1 text-sm text-muted-foreground"
              >
                {item}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
