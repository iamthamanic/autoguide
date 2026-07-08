import { describe, expect, it } from 'vitest';
import type { Fact } from '../types/fact.js';
import { generateRecommendations } from './engine.js';
import {
  formatRecommendationReviewHint,
  linkRecommendationsToReviewQueue,
  sortRecommendationsByPriority,
} from './link.js';

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

  it('creates recommendations for low-confidence facts with factId', () => {
    const recs = generateRecommendations([baseFact()]);
    const factRec = recs.find((r) => r.id.startsWith('rec-fact'));
    expect(factRec?.factId).toBe('fact-1');
  });

  it('clusters multiple low-confidence facts on the same entity', () => {
    const recs = generateRecommendations([
      baseFact({ id: 'fact-a', key: 'label', confidence: 0.4 }),
      baseFact({ id: 'fact-b', key: 'action', confidence: 0.45 }),
    ]);
    const cluster = recs.find((r) => r.id.startsWith('rec-cluster'));
    expect(cluster?.relatedFactIds).toEqual(['fact-a', 'fact-b']);
  });
});

describe('recommendation review links', () => {
  it('sorts blocking before info', () => {
    const sorted = sortRecommendationsByPriority([
      {
        id: '1',
        target: 'a',
        category: 'documentation',
        severity: 'info',
        message: 'info',
        rationale: '',
      },
      {
        id: '2',
        target: 'b',
        category: 'documentation',
        severity: 'blocking',
        message: 'block',
        rationale: '',
      },
    ]);
    expect(sorted[0]?.severity).toBe('blocking');
  });

  it('links fact recommendations to pending review items', () => {
    const recs = linkRecommendationsToReviewQueue(
      [{ ...generateRecommendations([baseFact()])[0]!, factId: 'fact-1' }],
      [
        {
          factId: 'fact-1',
          entityId: 'Page',
          key: 'title',
          value: 'Test',
          confidence: 0.55,
          reason: 'low',
        },
      ],
    );
    const hint = formatRecommendationReviewHint(recs[0]!, new Set(['fact-1']));
    expect(hint).toContain('autoguide review --accept fact-1');
  });
});
