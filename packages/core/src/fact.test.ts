import { describe, expect, it } from 'vitest';
import {
  factPrecedence,
  isFact,
  isVisibleInPublishedMode,
  type Fact,
} from './index.js';

const sampleFact: Fact = {
  id: 'fact-1',
  entityId: 'element-1',
  key: 'action',
  value: 'Speichern',
  status: 'verified',
  reviewStatus: 'approved',
  confidence: 0.92,
  provenance: [
    {
      source: 'runtime_dom',
      confidence: 0.92,
      observedAt: '2026-07-07T00:00:00.000Z',
      selector: '[data-testid=save]',
    },
  ],
  createdAt: '2026-07-07T00:00:00.000Z',
  updatedAt: '2026-07-07T00:00:00.000Z',
};

describe('@iamthamanic/autoguide-core fact model', () => {
  it('validates a well-formed fact', () => {
    expect(isFact(sampleFact)).toBe(true);
  });

  it('ranks manual_override above ai_proposal', () => {
    expect(factPrecedence('manual_override')).toBeGreaterThan(factPrecedence('ai_proposal'));
  });

  it('filters published visibility by review and confidence', () => {
    expect(isVisibleInPublishedMode(sampleFact)).toBe(true);
    expect(
      isVisibleInPublishedMode({ ...sampleFact, reviewStatus: 'pending' }),
    ).toBe(false);
    expect(isVisibleInPublishedMode({ ...sampleFact, confidence: 0.5 })).toBe(false);
  });
});
