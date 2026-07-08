/**
 * @autoguide/core — attach review-queue links to scan recommendations.
 */

import type { ReviewItem } from '../review/review-queue.js';
import type { Recommendation } from './types.js';

const SEVERITY_RANK: Record<Recommendation['severity'], number> = {
  blocking: 0,
  warning: 1,
  info: 2,
};

export function sortRecommendationsByPriority(
  recommendations: Recommendation[],
): Recommendation[] {
  return [...recommendations].sort(
    (a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity],
  );
}

/** Marks recommendations that map to pending review-queue items. */
export function linkRecommendationsToReviewQueue(
  recommendations: Recommendation[],
  reviewItems: ReviewItem[],
): Recommendation[] {
  const pending = new Set(reviewItems.map((item) => item.factId));
  return recommendations.map((rec) => {
    const related =
      rec.relatedFactIds?.filter((id) => pending.has(id)) ??
      (rec.factId && pending.has(rec.factId) ? [rec.factId] : undefined);
    if (!related || related.length === 0) return rec;
    return {
      ...rec,
      factId: rec.factId ?? related[0],
      relatedFactIds: related,
    };
  });
}

export function formatRecommendationReviewHint(
  recommendation: Recommendation,
  pendingFactIds: Set<string>,
): string | undefined {
  const ids =
    recommendation.relatedFactIds?.filter((id) => pendingFactIds.has(id)) ??
    (recommendation.factId && pendingFactIds.has(recommendation.factId)
      ? [recommendation.factId]
      : []);
  if (ids.length === 0) return undefined;
  if (ids.length === 1) return `Review: autoguide review --accept ${ids[0]}`;
  return `Review (${ids.length}): autoguide review --list`;
}
