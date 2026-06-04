import Link from "next/link";
import {
  ArrowRight,
  Github,
  Gauge,
  ListChecks,
  MessageSquareText,
  ShieldAlert,
  SmilePlus,
  Tags,
  Lightbulb,
  Sparkles,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { getIssueSummary, getOverview, getRiskSummary } from "@/lib/data";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/lib/i18n";
import { SITE } from "@/lib/constants";
import { formatCompact, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

const FEATURE_ICONS = [SmilePlus, Tags, ShieldAlert, Lightbulb];
const METHOD_CARD_ICONS = [MessageSquareText, Gauge, ListChecks];

export default async function HomePage() {
  const locale = getLocale();
  const t = getDictionary(locale);
  const [overview, issues, risk] = await Promise.all([
    getOverview(),
    getIssueSummary(),
    getRiskSummary(),
  ]);

  const stats = [
    {
      label: t.home.statComments,
      value: overview ? formatCompact(overview.usable_comments) : "—",
    },
    {
      label: t.home.statIssues,
      value: issues ? formatNumber(issues.issues.length) : "—",
    },
    {
      label: t.home.statFlagged,
      value: risk ? formatNumber(risk.total_flagged) : "—",
    },
  ];

  return (
    <div className="space-y-20">
      <section className="grid-bg relative -mx-4 rounded-2xl border border-border bg-card/30 px-6 py-16 sm:-mx-6 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/60 px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            {t.home.badge}
          </span>
          <h1 className="mt-6 text-balance leading-[1.02] tracking-[-0.03em]">
            <span className="block text-4xl font-extrabold text-ink sm:text-5xl">
              VoxPop
            </span>
            <span className="block text-5xl font-extrabold text-gold sm:text-6xl">
              MBG
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-balance text-base text-foreground/80 sm:text-lg">
            {t.home.tagline}
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
            {t.home.subtitle}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/dashboard" className={cn(buttonVariants({ size: "lg" }))}>
              {t.common.exploreDashboard} <ArrowRight className="h-4 w-4" />
            </Link>
            {SITE.githubUrl ? (
              <a
                href={SITE.githubUrl}
                target="_blank"
                rel="noreferrer"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
              >
                <Github className="h-4 w-4" /> {t.common.viewGithub}
              </a>
            ) : null}
          </div>
          <dl className="mx-auto mt-12 grid max-w-2xl grid-cols-3 gap-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg border border-border bg-background/50 p-4"
              >
                <dt className="text-xs text-muted-foreground">{stat.label}</dt>
                <dd className="mt-1 text-2xl font-semibold tabular-nums">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section>
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div className="space-y-4">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[#9c7d2f]">
              {t.home.problemEyebrow}
            </p>
            <h2 className="text-2xl font-extrabold tracking-[-0.02em] text-ink sm:text-[1.7rem]">
              {t.home.problemTitle}
            </h2>
            <p className="text-muted-foreground">{t.home.problemBody}</p>
          </div>
          <Card>
            <CardContent className="p-6">
              <ul className="space-y-3">
                {t.home.questions.map((question, index) => (
                  <li key={question} className="flex items-start gap-3 text-sm">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                      {index + 1}
                    </span>
                    <span className="text-foreground">{question}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-6">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-extrabold tracking-[-0.02em] text-ink sm:text-[1.7rem]">
            {t.home.featuresTitle}
          </h2>
          <p className="mt-2 text-muted-foreground">{t.home.featuresSubtitle}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {t.home.features.map((feature, index) => {
            const Icon = FEATURE_ICONS[index];
            return (
              <Card key={feature.title} className="h-full">
                <CardContent className="space-y-3 p-6">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="space-y-6">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-extrabold tracking-[-0.02em] text-ink sm:text-[1.7rem]">
            {t.home.methodTitle}
          </h2>
          <p className="mt-2 text-muted-foreground">{t.home.methodSubtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {t.home.methodSteps.map((step, index) => (
            <div key={step} className="flex items-center gap-2">
              <span className="rounded-md border border-border bg-card px-3 py-2 text-sm">
                {step}
              </span>
              {index < t.home.methodSteps.length - 1 ? (
                <ArrowRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              ) : null}
            </div>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {t.home.methodCards.map((card, index) => {
            const Icon = METHOD_CARD_ICONS[index];
            return (
              <Card key={card.title}>
                <CardContent className="space-y-1 p-5">
                  <Icon className="h-5 w-5 text-primary" />
                  <h3 className="mt-2 font-semibold">{card.title}</h3>
                  <p className="text-sm text-muted-foreground">{card.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-extrabold tracking-[-0.02em] text-ink sm:text-[1.7rem]">
          {t.home.skillsTitle}
        </h2>
        <div className="flex flex-wrap gap-2">
          {t.home.skills.map((skill) => (
            <span
              key={skill}
              className="rounded-full border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground"
            >
              {skill}
            </span>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-gradient-to-br from-navy/[0.06] to-gold/[0.12] p-8 text-center shadow-card sm:p-12">
        <h2 className="text-2xl font-extrabold tracking-[-0.02em] text-ink sm:text-[1.7rem]">
          {t.home.ctaTitle}
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-muted-foreground">{t.home.ctaSubtitle}</p>
        <Link href="/dashboard" className={cn(buttonVariants({ size: "lg" }), "mt-6")}>
          {t.common.openDashboard} <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}
