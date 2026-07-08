/**
 * @autoguide/react — shared types for review UI.
 */

import type {
  Fact,
  Recommendation,
  ReviewActionRecord,
  ReviewItem,
} from '@autoguide/core';

export interface ReviewDecisionPayload {
  fact: Fact;
  reviews: ReviewItem[];
  history: ReviewActionRecord[];
  recommendation?: Recommendation;
}
