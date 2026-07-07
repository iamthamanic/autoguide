import { describe, expect, it } from 'vitest';
import { KnowledgeGraph, ReviewQueue, scoreFromProvenance } from './index.js';
import type { Fact, Provenance } from './types/fact.js';

function makeFact(partial: Partial<Fact> & Pick<Fact, 'id' | 'key' | 'value'>): Fact {
  const now = new Date().toISOString();
  return {
    entityId: 'el-1',
    status: 'needs_review',
    reviewStatus: 'pending',
    confidence: 0.6,
    provenance: [],
    createdAt: now,
    updatedAt: now,
    ...partial,
  };
}

describe('confidence and graph', () => {
  it('scores provenance by evidence hierarchy', () => {
    const provenance: Provenance[] = [
      { source: 'runtime_dom', confidence: 0.9, observedAt: nowIso() },
      { source: 'developer_review', confidence: 0.95, observedAt: nowIso() },
    ];
    expect(scoreFromProvenance(provenance)).toBeGreaterThan(0.9);
  });

  it('merges facts and detects conflicts', () => {
    const graph = new KnowledgeGraph();
    const a = makeFact({ id: 'f1', key: 'label', value: 'Save' });
    const b = makeFact({ id: 'f2', key: 'label', value: 'Speichern' });
    graph.addFact(a);
    const result = graph.mergeFacts([b]);
    expect(result.conflicts.length).toBe(1);
  });

  it('queues low-confidence facts for review', () => {
    const queue = new ReviewQueue();
    const fact = makeFact({ id: 'f1', key: 'label', value: 'Save', confidence: 0.4 });
    const items = queue.seedFromFacts([fact]);
    expect(items.length).toBe(1);
    const approved = queue.applyDecision(fact, 'approved', 'Speichern');
    expect(approved.status).toBe('manual_override');
  });
});

function nowIso(): string {
  return new Date().toISOString();
}
