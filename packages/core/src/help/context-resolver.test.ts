/**
 * @iamthamanic/autoguide-core — help context prefers labels over handler noise.
 */

import { describe, expect, it } from 'vitest';
import { resolveHelpContext } from './context-resolver.js';
import type { Fact } from '../types/fact.js';
import type { PageRecord } from '../types/records.js';

function fact(partial: Partial<Fact> & Pick<Fact, 'id' | 'key' | 'value'>): Fact {
  const now = '2026-07-17T00:00:00.000Z';
  return {
    entityId: 'e1',
    status: 'verified',
    reviewStatus: 'approved',
    confidence: 0.9,
    provenance: [{ source: 'source_code', confidence: 0.9, observedAt: now }],
    createdAt: now,
    updatedAt: now,
    ...partial,
  };
}

describe('resolveHelpContext handler noise', () => {
  it('excludes on*/handle* values and prefers label facts', () => {
    const page: PageRecord = {
      id: 'p1',
      route: '/',
      title: 'Home',
      roleIds: [],
      elementIds: [],
      featureIds: [],
      flowIds: [],
      factIds: ['f-noise', 'f-label', 'f-action'],
      status: 'draft',
    };
    const ctx = resolveHelpContext(
      '/',
      [page],
      [],
      [
        fact({ id: 'f-noise', key: 'handler', value: 'onSave' }),
        fact({ id: 'f-label', key: 'label', value: 'Speichern' }),
        fact({ id: 'f-action', key: 'action', value: 'submitVacationRequest' }),
      ],
      'development',
    );
    expect(ctx.actions.map((a) => a.id)).toEqual(['f-label', 'f-action']);
    expect(ctx.actions[0]?.value).toBe('Speichern');
  });
});
