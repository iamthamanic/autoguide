/**
 * @iamthamanic/autoguide-react — apply review decisions via core ReviewQueue.
 */

import {
  ReviewQueue,
  type Fact,
  type ReviewActionRecord,
  type ReviewItem,
} from '@iamthamanic/autoguide-core';
import type { ReviewDecisionPayload } from './review-types.js';

export function applyReviewDecision(
  factId: string,
  status: 'approved' | 'rejected',
  facts: Fact[],
  reviews: ReviewItem[],
  history: ReviewActionRecord[],
  editedValue?: string,
): ReviewDecisionPayload | null {
  const fact = facts.find((entry) => entry.id === factId);
  if (!fact) return null;

  const queue = new ReviewQueue();
  queue.loadFromItems(reviews);
  queue.loadHistory(history);
  queue.seedOverridesFromFacts(facts);

  const result = queue.applyReviewWithVerification(
    fact,
    status,
    editedValue,
    facts,
  );

  return {
    fact: result.fact,
    reviews: queue.list(),
    history: queue.getHistory(),
    recommendation: result.recommendation,
  };
}
