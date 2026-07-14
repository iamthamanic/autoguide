/**
 * @iamthamanic/autoguide-core — confidence artifact builder tests.
 */

import { describe, expect, it } from 'vitest';
import type { Fact } from '../types/fact.js';
import {
  applyFactConfidencePolicies,
  buildConfidenceArtifact,
  evidenceFamiliesForFact,
} from './artifact.js';
import { scoreFromProvenance } from './score.js';

function nowIso(): string {
  return new Date().toISOString();
}

function makeFact(partial: Partial<Fact> & Pick<Fact, 'id' | 'key' | 'value'>): Fact {
  const now = nowIso();
  return {
    entityId: 'btn-delete',
    status: 'needs_review',
    reviewStatus: 'pending',
    confidence: 0.6,
    provenance: [],
    createdAt: now,
    updatedAt: now,
    ...partial,
  };
}

describe('confidence artifact', () => {
  it('lists evidence families from provenance', () => {
    const fact = makeFact({
      id: 'f1',
      key: 'label',
      value: 'Save',
      provenance: [
        { source: 'source_code', confidence: 0.9, observedAt: nowIso() },
        { source: 'runtime_dom', confidence: 0.85, observedAt: nowIso() },
      ],
    });
    expect(evidenceFamiliesForFact(fact)).toEqual(['source_code', 'runtime_dom']);
  });

  it('builds confidence.json with scores, families, conflicts, and stale ids', () => {
    const facts = [
      makeFact({
        id: 'f1',
        key: 'label',
        value: 'Save',
        confidence: scoreFromProvenance([
          { source: 'source_code', confidence: 0.9, observedAt: nowIso() },
          { source: 'runtime_dom', confidence: 0.85, observedAt: nowIso() },
        ]),
        provenance: [
          { source: 'source_code', confidence: 0.9, observedAt: nowIso() },
          { source: 'runtime_dom', confidence: 0.85, observedAt: nowIso() },
        ],
      }),
      makeFact({
        id: 'f2',
        key: 'label',
        value: 'Other',
        status: 'conflict',
        provenance: [{ source: 'source_code', confidence: 0.9, observedAt: nowIso() }],
      }),
      makeFact({
        id: 'f3',
        key: 'title',
        value: 'Old',
        status: 'stale',
        provenance: [{ source: 'developer_review', confidence: 1, observedAt: nowIso() }],
      }),
    ];

    const artifact = buildConfidenceArtifact(facts, [
      { existingId: 'f1', incomingId: 'f2', key: 'label', reason: 'unresolvable_conflict' },
    ]);

    expect(artifact.scores.f1).toBeGreaterThanOrEqual(0.85);
    expect(artifact.facts.f1?.evidenceFamilies).toContain('runtime_dom');
    expect(artifact.conflicts[0]?.status).toBe('conflict');
    expect(artifact.staleFactIds).toEqual(['f3']);
  });

  it('forces needs_review for weak destructive actions', () => {
    const weakDelete = makeFact({
      id: 'f-delete',
      key: 'deleteUser',
      value: 'Delete',
      confidence: 0.75,
      provenance: [{ source: 'ai_enrichment', confidence: 0.75, observedAt: nowIso() }],
    });
    const adjusted = applyFactConfidencePolicies(weakDelete);
    expect(adjusted.status).toBe('needs_review');
  });

  it('preserves conflict metadata when applying confidence policies', () => {
    const conflicted = makeFact({
      id: 'f1',
      key: 'label',
      value: 'Save',
      status: 'conflict',
      conflict: {
        status: 'conflict',
        reason: 'unresolvable_conflict',
        competingFacts: ['f1', 'f2'],
      },
      provenance: [{ source: 'source_code', confidence: 0.9, observedAt: nowIso() }],
    });
    const adjusted = applyFactConfidencePolicies(conflicted);
    expect(adjusted.conflict).toEqual(conflicted.conflict);
    expect(adjusted.status).toBe('conflict');
  });
});
