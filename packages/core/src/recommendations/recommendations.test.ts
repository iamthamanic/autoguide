import { describe, expect, it } from 'vitest';
import type { Fact } from '../types/fact.js';
import { generateRecommendations } from './engine.js';

const baseFact = (overrides: Partial<Fact> = {}): Fact => ({
  id: 'fact-1',
  entityId: 'Page',
  key: 'title',
  value: 'Test',
  status: 'needs_review',
  reviewStatus: 'pending',
  confidence: 0.55,
  provenance: [
    {
      source: 'source_code',
      filePath: 'src/Page.tsx',
      confidence: 0.55,
      observedAt: '2026-01-01T00:00:00.000Z',
    },
  ],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

describe('generateRecommendations', () => {
  it('detects missing aria-label hints', () => {
    const recs = generateRecommendations([], [
      { filePath: 'src/Page.tsx', line: 12, missingAriaLabel: true, componentName: 'Toolbar' },
    ]);
    expect(recs.some((r) => r.category === 'accessibility')).toBe(true);
    expect(recs[0]?.message).toMatch(/aria-label/);
  });

  it('flags generic handler names', () => {
    const recs = generateRecommendations([], [
      {
        filePath: 'src/Page.tsx',
        handlerName: 'handleClick',
        hasDataDoc: false,
        line: 8,
      },
    ]);
    expect(recs.some((r) => r.category === 'naming')).toBe(true);
    expect(recs.some((r) => r.category === 'metadata')).toBe(true);
  });

  it('creates recommendations for low-confidence facts', () => {
    const recs = generateRecommendations([baseFact()]);
    expect(recs.some((r) => r.id.startsWith('rec-fact'))).toBe(true);
  });
});
