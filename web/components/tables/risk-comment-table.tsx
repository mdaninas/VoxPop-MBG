"use client";

import * as React from "react";

import { CommentTable, type CommentTableRow } from "./comment-table";
import type { CommentSample, Locale } from "@/lib/types";

function toCommentTableRow(comment: CommentSample): CommentTableRow {
  return {
    id: comment.id,
    text: comment.text,
    sentiment: comment.sentiment,
    sentiment_confidence: comment.sentiment_confidence,
    issue_id: comment.issue_id,
    issue_name: comment.issue_name,
    risk_score: comment.risk_score,
    risk_level: comment.risk_level,
    risk_reasons: comment.risk_reasons,
  };
}

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
        .sort((a, b) => b.risk_score - a.risk_score)
        .map(toCommentTableRow),
    [comments],
  );

  return <CommentTable comments={flagged} locale={locale} showRiskReasons />;
}
