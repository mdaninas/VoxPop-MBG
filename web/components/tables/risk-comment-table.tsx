"use client";

import * as React from "react";

import { CommentTable } from "./comment-table";
import type { CommentSample, Locale } from "@/lib/types";

export function RiskCommentTable({
  comments,
  locale,
}: {
  comments: CommentSample[];
  locale: Locale;
}) {
  const flagged = React.useMemo(
    () =>
      comments
        .filter((comment) => comment.risk_level !== "low")
        .sort((a, b) => b.risk_score - a.risk_score),
    [comments],
  );

  return <CommentTable comments={flagged} locale={locale} showRiskReasons />;
}
