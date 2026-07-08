import { describe, expect, it } from 'vitest';
import type { Fact } from '../types/fact.js';
import { ReviewQueue } from './review-queue.js';
import { recommendationForUnsupportedEdit, verifyEditedFact } from './verify-fact.js';

function makeFact(partial: Partial<Fact> & Pick<Fact, 'id' | 'key' | 'value'>): Fact {
  const now = new Date().toISOString();
  return {
    entityId: 'el-1',
    status: 'needs_review',
    reviewStatus: 'pending',
    confidence: 0.6,
    provenance: [{ source: 'source_code', confidence: 0.8, observedAt: now }],
    createdAt: now,
    updatedAt: now,
    ...partial,
  };
}

describe('review verification loop', () => {
  it('verifies edits that match scan evidence', () => {
    const fact = makeFact({ id: 'f1', key: 'label', value: 'Save' });
    const evidence = makeFact({ id: 'f2', key: 'label', value: 'Speichern' });
    const result = verifyEditedFact(fact, 'Speichern', [fact, evidence]);
    expect(result.action).toBe('verified_after_edit');
    expect(result.supported).toBe(true);
  });

  it('flags unsupported manual knowledge', () => {
    const fact = makeFact({ id: 'f1', key: 'label', value: 'Save' });
    const result = verifyEditedFact(fact, 'Completely invented', [fact]);
    expect(result.action).toBe('unsupported_manual_knowledge');
    expect(result.supported).toBe(false);
    expect(recommendationForUnsupportedEdit(fact, 'Completely invented').severity).toBe('warning');
  });

  it('persists edited facts with review action history', () => {
    const queue = new ReviewQueue();
    const fact = makeFact({ id: 'f1', key: 'label', value: 'Save', confidence: 0.4 });
    const evidence = makeFact({ id: 'f2', key: 'label', value: 'Speichern' });
    queue.seedFromFacts([fact]);

    const result = queue.applyReviewWithVerification(fact, 'approved', 'Speichern', [fact, evidence]);
    expect(result.fact.status).toBe('manual_override');
    expect(result.fact.reviewStatus).toBe('approved');
    expect(result.record.action).toBe('verified_after_edit');
    expect(queue.getHistory()).toHaveLength(1);
  });

  it('prevents AI proposals from overwriting manual review', () => {
    const manual = makeFact({
      id: 'f1',
      key: 'label',
      value: 'Speichern',
      status: 'manual_override',
      reviewStatus: 'approved',
      confidence: 0.95,
    });
    const queue = new ReviewQueue();
    queue.seedOverridesFromFacts([manual]);

    const incoming = makeFact({ id: 'ai-1', key: 'label', value: 'AI text', status: 'ai_proposal' });
    expect(queue.canReplace(manual, incoming)).toBe(false);
    expect(queue.getOverride('f1')?.value).toBe('Speichern');
  });
});
