/**
 * @iamthamanic/autoguide-core — machine-readable confidence.json builder (v2).
 */

import type { Fact, Provenance, ProvenanceSource } from '../types/fact.js';
import type { ConflictResolution } from './conflict.js';
import { needsReview, minimumConfidenceForKey } from './score.js';

export type ConfidenceConflictStatus = 'conflict' | 'resolved' | 'needs_review';

export type ConfidenceConflictRecord = {
  status: ConfidenceConflictStatus;
  reason: string;
  competingFacts: string[];
  key: string;
  selectedFactId?: string;
  resolutionSource?: 'evidence_tier' | 'developer_review' | 'manual_override';
};

export type ConfidenceFactRecord = {
  confidence: number;
  evidenceFamilies: string[];
  status: Fact['status'];
  needsReview: boolean;
};

export type ConfidenceArtifact = {
  scores: Record<string, number>;
  facts: Record<string, ConfidenceFactRecord>;
  conflicts: ConfidenceConflictRecord[];
  staleFactIds: string[];
};

const EVIDENCE_FAMILY: Partial<Record<ProvenanceSource, string>> = {
  source_code: 'source_code',
  accessibility_tree: 'accessibility_tree',
  runtime_dom: 'runtime_dom',
  playwright_trace: 'playwright_trace',
  developer_review: 'developer_review',
  config: 'config',
  ai_enrichment: 'ai_enrichment',
  plugin: 'plugin',
};

export function evidenceFamiliesForFact(fact: Fact): string[] {
  const families = new Set<string>();
  for (const item of fact.provenance) {
    const family = EVIDENCE_FAMILY[item.source];
    if (family) families.add(family);
  }
  return [...families];
}

export function applyFactConfidencePolicies(fact: Fact): Fact {
  const minConfidence = minimumConfidenceForKey(fact.key);
  const aiOnly =
    fact.provenance.length > 0 && fact.provenance.every((item) => item.source === 'ai_enrichment');

  if (fact.status === 'conflict') {
    return fact;
  }

  if (fact.confidence < minConfidence || (aiOnly && needsReview(fact.confidence))) {
    return {
      ...fact,
      status: 'needs_review',
      reviewStatus: fact.reviewStatus === 'approved' ? 'pending' : fact.reviewStatus,
      updatedAt: new Date().toISOString(),
    };
  }

  return fact;
}

function conflictStatusFromMerge(
  mergeConflict: { existingId: string; incomingId: string; key: string; reason: string },
  facts: Fact[],
): ConfidenceConflictRecord {
  const existing = facts.find((fact) => fact.id === mergeConflict.existingId);
  const incoming = facts.find((fact) => fact.id === mergeConflict.incomingId);
  const competingFacts = [mergeConflict.existingId, mergeConflict.incomingId];
  const competing = competingFacts
    .map((id) => facts.find((fact) => fact.id === id))
    .filter((fact): fact is Fact => Boolean(fact));

  if (competing.some((fact) => fact.status === 'conflict')) {
    return {
      status: 'conflict',
      reason: mergeConflict.reason,
      competingFacts,
      key: mergeConflict.key,
    };
  }

  const winner = facts.find(
    (fact) =>
      fact.key === mergeConflict.key &&
      (fact.id === mergeConflict.existingId || fact.id === mergeConflict.incomingId) &&
      fact.status !== 'conflict',
  );

  if (winner && winner.status !== 'conflict') {
    return {
      status: 'resolved',
      reason: mergeConflict.reason,
      competingFacts,
      key: mergeConflict.key,
      selectedFactId: winner.id,
      resolutionSource:
        winner.provenance.some((item) => item.source === 'developer_review')
          ? 'developer_review'
          : winner.status === 'manual_override'
            ? 'manual_override'
            : 'evidence_tier',
    };
  }

  const conflictFact = existing?.status === 'conflict' ? existing : incoming;
  if (conflictFact?.status === 'conflict') {
    return {
      status: 'conflict',
      reason: mergeConflict.reason,
      competingFacts,
      key: mergeConflict.key,
    };
  }

  return {
    status: 'needs_review',
    reason: mergeConflict.reason,
    competingFacts,
    key: mergeConflict.key,
  };
}

export function buildConfidenceArtifact(
  facts: Fact[],
  mergeConflicts: Array<{ existingId: string; incomingId: string; key: string; reason: string }> = [],
): ConfidenceArtifact {
  const scores: Record<string, number> = {};
  const factRecords: Record<string, ConfidenceFactRecord> = {};
  const staleFactIds: string[] = [];

  for (const fact of facts) {
    scores[fact.id] = fact.confidence;
    factRecords[fact.id] = {
      confidence: fact.confidence,
      evidenceFamilies: evidenceFamiliesForFact(fact),
      status: fact.status,
      needsReview: needsReview(fact.confidence) || fact.status === 'needs_review' || fact.status === 'conflict',
    };
    if (fact.status === 'stale') {
      staleFactIds.push(fact.id);
    }
  }

  const conflicts = mergeConflicts.map((item) => conflictStatusFromMerge(item, facts));

  return {
    scores,
    facts: factRecords,
    conflicts,
    staleFactIds,
  };
}

export type { ConflictResolution };
