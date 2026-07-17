/**
 * @iamthamanic/autoguide-core — sufficiency gate unit tests.
 * Location: packages/core/src/sufficiency/evaluate.test.ts
 */

import { describe, expect, it } from 'vitest';
import type { Fact } from '../types/fact.js';
import type { FlowRecord, PageRecord } from '../types/records.js';
import {
  evaluateSufficiency,
  formatSufficiencySummary,
  isInteractiveFact,
} from './evaluate.js';

function fact(partial: Partial<Fact> & Pick<Fact, 'id' | 'key'>): Fact {
  const now = '2026-07-17T00:00:00.000Z';
  return {
    entityId: 'e1',
    value: 'x',
    status: 'needs_review',
    reviewStatus: 'pending',
    confidence: 0.8,
    provenance: [
      {
        source: 'source_code',
        confidence: 0.8,
        observedAt: now,
      },
    ],
    createdAt: now,
    updatedAt: now,
    ...partial,
  };
}

function page(id: string, route: string): PageRecord {
  return {
    id,
    route,
    title: route,
    roleIds: [],
    elementIds: [],
    featureIds: [],
    flowIds: [],
    factIds: [],
    status: 'draft',
  };
}

function flow(id: string, stepCount: number): FlowRecord {
  return {
    id,
    title: id,
    steps: Array.from({ length: stepCount }, (_, i) => ({
      order: i + 1,
      title: `step ${i + 1}`,
      factIds: [],
    })),
    roleIds: [],
    pageIds: [],
    factIds: [],
    status: 'draft',
  };
}

describe('evaluateSufficiency', () => {
  it('returns blocked when no pages and no facts', () => {
    const report = evaluateSufficiency({ flows: [], facts: [], pages: [] });
    expect(report.status).toBe('blocked');
    expect(report.reasons.some((r) => r.code === 'no_evidence')).toBe(true);
    expect(report.reasons[0]?.messageDe).toMatch(/Blockiert/);
  });

  it('returns sufficient when ≥1 ordered flow exists', () => {
    const report = evaluateSufficiency({
      flows: [flow('f1', 2)],
      facts: [],
      pages: [],
    });
    expect(report.status).toBe('sufficient');
    expect(report.evidence.orderedFlowCount).toBe(1);
    expect(report.reasons.some((r) => r.code === 'ordered_flows')).toBe(true);
  });

  it('returns sufficient when interactive facts + pages meet threshold', () => {
    const facts = [
      fact({ id: 'a', key: 'element' }),
      fact({ id: 'b', key: 'onSave' }),
      fact({ id: 'c', key: 'step', provenance: [{ source: 'playwright_trace', confidence: 0.9, observedAt: '2026-07-17T00:00:00.000Z' }] }),
    ];
    const report = evaluateSufficiency({
      flows: [],
      facts,
      pages: [page('p1', '/')],
    });
    expect(report.status).toBe('sufficient');
    expect(report.evidence.interactiveFactCount).toBe(3);
  });

  it('returns escalate when pages exist but thresholds unmet', () => {
    const report = evaluateSufficiency({
      flows: [flow('empty', 0)],
      facts: [fact({ id: 'a', key: 'element' })],
      pages: [page('p1', '/'), page('p2', '/about')],
    });
    expect(report.status).toBe('escalate');
    expect(report.reasons.some((r) => r.messageDe.includes('Eskalation'))).toBe(true);
  });

  it('does not treat route-only facts as interactive', () => {
    expect(
      isInteractiveFact(
        fact({
          id: 'r',
          key: 'route',
          provenance: [{ source: 'source_code', confidence: 0.5, observedAt: '2026-07-17T00:00:00.000Z' }],
        }),
      ),
    ).toBe(false);
  });

  it('formatSufficiencySummary includes German status label', () => {
    const report = evaluateSufficiency({ flows: [], facts: [], pages: [] });
    expect(formatSufficiencySummary(report)).toMatch(/Sufficiency \(blockiert\)/);
  });
});
