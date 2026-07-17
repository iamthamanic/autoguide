/**
 * @iamthamanic/autoguide-core — review queue filters generic handler noise.
 */

import { describe, expect, it } from 'vitest';
import { ReviewQueue } from './review-queue.js';
import { isGenericHandlerName, isGenericHandlerNoiseFact } from '../naming/generic-handlers.js';
import type { Fact } from '../types/fact.js';

function makeFact(partial: Partial<Fact> & Pick<Fact, 'id' | 'key' | 'value'>): Fact {
  const now = new Date().toISOString();
  return {
    entityId: 'el-1',
    status: 'needs_review',
    reviewStatus: 'pending',
    confidence: 0.4,
    provenance: [],
    createdAt: now,
    updatedAt: now,
    ...partial,
  };
}

describe('generic handler noise', () => {
  it('detects boilerplate handler names', () => {
    expect(isGenericHandlerName('handleSubmit')).toBe(true);
    expect(isGenericHandlerName('onClick')).toBe(true);
    expect(isGenericHandlerName('submitVacationRequest')).toBe(false);
  });

  it('treats broader on*/handle* identifiers as review/Help noise', () => {
    expect(isGenericHandlerNoiseFact({ key: 'handler', value: 'onSave' })).toBe(true);
    expect(isGenericHandlerNoiseFact({ key: 'action', value: 'handleLogin' })).toBe(true);
    expect(isGenericHandlerNoiseFact({ key: 'label', value: 'Speichern' })).toBe(false);
    expect(isGenericHandlerNoiseFact({ key: 'action', value: 'submitVacationRequest' })).toBe(false);
  });

  it('excludes generic handlers from review seed but keeps real candidates', () => {
    const queue = new ReviewQueue();
    const items = queue.seedFromFacts([
      makeFact({ id: 'f-noise', key: 'handler', value: 'handleSubmit', entityId: 'handler:handleSubmit' }),
      makeFact({ id: 'f-onsave', key: 'handler', value: 'onSave', entityId: 'btn-save' }),
      makeFact({ id: 'f-real', key: 'label', value: 'Urlaubsantrag speichern', entityId: 'btn-save' }),
      makeFact({ id: 'f-click', key: 'action', value: 'handleClick', entityId: 'btn-x' }),
    ]);

    expect(items.some((item) => item.factId === 'f-noise')).toBe(false);
    expect(items.some((item) => item.factId === 'f-onsave')).toBe(false);
    expect(items.some((item) => item.factId === 'f-click')).toBe(false);
    expect(items.some((item) => item.factId === 'f-real')).toBe(true);
    expect(isGenericHandlerNoiseFact({ key: 'handler', value: 'handleSubmit' })).toBe(true);
  });

  it('still queues stale generic-handler facts but down-ranks them', () => {
    const queue = new ReviewQueue();
    const items = queue.seedFromFacts([
      makeFact({
        id: 'f-stale-generic',
        key: 'handler',
        value: 'handleSubmit',
        status: 'stale',
        confidence: 0.9,
      }),
      makeFact({
        id: 'f-stale-real',
        key: 'label',
        value: 'Genehmigen',
        status: 'stale',
        confidence: 0.5,
      }),
    ]);
    expect(items.map((item) => item.factId)).toEqual(['f-stale-real', 'f-stale-generic']);
  });
});
