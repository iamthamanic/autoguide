import { describe, expect, it } from 'vitest';
import type { Fact, Provenance } from '../types/fact.js';
import { KnowledgeGraph, resolveFactConflict, scoreFromProvenance } from '../index.js';
import {
  flowStepNeedsReview,
  isDestructiveFlowStep,
  minimumConfidenceForFlowStep,
} from './flow-step.js';
import { applyFactConfidencePolicies } from './artifact.js';
import { markAffectedFeaturesStale } from '../history/mark-features-stale.js';
import type { FeatureRecord, PageRecord } from '../types/records.js';

function nowIso(): string {
  return new Date().toISOString();
}

function prov(source: Provenance['source'], confidence = 0.9): Provenance {
  return { source, confidence, observedAt: nowIso() };
}

function makeFact(partial: Partial<Fact> & Pick<Fact, 'id' | 'key' | 'value'>): Fact {
  const now = nowIso();
  return {
    entityId: 'btn-save',
    status: 'needs_review',
    reviewStatus: 'pending',
    confidence: 0.6,
    provenance: [],
    createdAt: now,
    updatedAt: now,
    ...partial,
  };
}

describe('confidence engine v2', () => {
  it('scores multi-source corroboration higher than a single source', () => {
    const single = scoreFromProvenance([prov('source_code', 0.9)]);
    const multi = scoreFromProvenance([
      prov('source_code', 0.9),
      prov('runtime_dom', 0.85),
      prov('playwright_trace', 0.87),
    ]);
    expect(multi).toBeGreaterThan(single);
    expect(multi).toBeGreaterThanOrEqual(0.85);
  });

  it('follows SPEC evidence hierarchy for developer review', () => {
    const score = scoreFromProvenance([
      prov('runtime_dom', 0.9),
      prov('developer_review', 0.95),
    ]);
    expect(score).toBeGreaterThan(0.9);
  });

  it('penalizes AI-only evidence', () => {
    const aiOnly = scoreFromProvenance([prov('ai_enrichment', 0.8)]);
    const withSource = scoreFromProvenance([
      prov('ai_enrichment', 0.8),
      prov('source_code', 0.85),
    ]);
    expect(withSource).toBeGreaterThan(aiOnly);
  });

  it('resolves conflicts by evidence tier', () => {
    const existing = makeFact({
      id: 'f1',
      key: 'label',
      value: 'Save',
      provenance: [prov('runtime_dom', 0.85)],
    });
    const incoming = makeFact({
      id: 'f2',
      key: 'label',
      value: 'Speichern',
      provenance: [prov('source_code', 0.9)],
    });
    expect(resolveFactConflict(existing, incoming).winner).toBe('incoming');
  });

  it('flags unresolvable conflicts at equal tier and confidence', () => {
    const existing = makeFact({ id: 'f1', key: 'label', value: 'Save', provenance: [prov('source_code')] });
    const incoming = makeFact({
      id: 'f2',
      key: 'label',
      value: 'Speichern',
      provenance: [prov('source_code')],
    });
    expect(resolveFactConflict(existing, incoming).winner).toBe('conflict');
  });

  it('merges same-value facts and boosts confidence with corroboration', () => {
    const graph = new KnowledgeGraph();
    const a = makeFact({
      id: 'f1',
      key: 'label',
      value: 'Speichern',
      provenance: [prov('source_code', 0.9)],
    });
    const b = makeFact({
      id: 'f2',
      key: 'label',
      value: 'Speichern',
      provenance: [prov('runtime_dom', 0.85)],
    });
    graph.addFact(a);
    graph.mergeFacts([b]);
    const merged = graph.listFacts()[0]!;
    expect(merged.provenance).toHaveLength(2);
    expect(merged.confidence).toBeGreaterThan(scoreFromProvenance([prov('source_code', 0.9)]));
  });

  it('requires higher confidence for destructive flow steps', () => {
    expect(isDestructiveFlowStep({ title: 'Delete employee record' })).toBe(true);
    expect(minimumConfidenceForFlowStep({ title: 'Delete employee record' })).toBe(0.9);
    expect(flowStepNeedsReview({ title: 'Delete employee record' }, 0.85)).toBe(true);
    expect(flowStepNeedsReview({ title: 'Open dashboard' }, 0.85)).toBe(false);
  });

  it('forces needs_review for weak destructive fact keys', () => {
    const weakDelete = makeFact({
      id: 'f-delete',
      key: 'deleteUser',
      value: 'Delete',
      confidence: 0.75,
      provenance: [prov('ai_enrichment', 0.75)],
    });
    const adjusted = applyFactConfidencePolicies(weakDelete);
    expect(adjusted.status).toBe('needs_review');
  });

  it('marks features stale when linked elements change', () => {
    const features: FeatureRecord[] = [
      {
        id: 'feature-1',
        title: 'DashboardPage',
        pageIds: [],
        roleIds: [],
        elementIds: ['DashboardPage'],
        flowIds: [],
        factIds: ['f1'],
        status: 'draft',
      },
    ];
    const pages: PageRecord[] = [
      {
        id: 'page-1',
        route: '/dashboard',
        title: 'Dashboard',
        roleIds: [],
        elementIds: [],
        featureIds: [],
        flowIds: [],
        factIds: [],
        status: 'draft',
      },
    ];
    const updated = markAffectedFeaturesStale(
      features,
      {
        changedFiles: ['src/App.tsx'],
        changedRoutes: ['/dashboard'],
        changedComponents: ['DashboardPage'],
        uncertain: false,
      },
      pages,
      new Set(['f1']),
    );
    expect(updated[0]?.status).toBe('stale');
  });
});
