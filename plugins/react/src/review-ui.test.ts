import { describe, expect, it } from 'vitest';
import type { Fact, ReviewItem } from '@autoguide/core';
import { applyReviewDecision } from './apply-review.js';

const pendingFact: Fact = {
  id: 'f1',
  entityId: 'btn-save',
  key: 'action',
  value: 'Speichern',
  status: 'needs_review',
  reviewStatus: 'pending',
  confidence: 0.6,
  provenance: [{ source: 'runtime_dom', confidence: 0.6, observedAt: '2026-01-01T00:00:00.000Z' }],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const reviewItems: ReviewItem[] = [
  {
    factId: 'f1',
    entityId: 'btn-save',
    key: 'action',
    value: 'Speichern',
    confidence: 0.6,
    reason: 'Confidence 0.6 unter Schwellwert 0.85',
  },
];

describe('review ui decision flow', () => {
  it('accept marks fact approved and clears queue item', () => {
    const payload = applyReviewDecision('f1', 'approved', [pendingFact], reviewItems, [], undefined);
    expect(payload?.fact.reviewStatus).toBe('approved');
    expect(payload?.reviews).toHaveLength(0);
  });

  it('reject clears queue item', () => {
    const payload = applyReviewDecision('f1', 'rejected', [pendingFact], reviewItems, [], undefined);
    expect(payload?.reviews).toHaveLength(0);
  });
});
