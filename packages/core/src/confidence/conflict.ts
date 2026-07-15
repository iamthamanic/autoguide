/**
 * @iamthamanic/autoguide-core — conflict resolution by evidence hierarchy.
 */

import type { Fact, FactConflict, FactConflictResolutionSource } from '../types/fact.js';
import { maxEvidenceTier, scoreFromProvenance } from './score.js';

export type ConflictWinner = 'existing' | 'incoming' | 'conflict';

export interface ConflictResolution {
  winner: ConflictWinner;
  reason: string;
}

const CONFIDENCE_GAP = 0.05;

export function createFactConflict(
  existing: Fact,
  incoming: Fact,
  reason: string,
  status: FactConflict['status'] = 'conflict',
  selectedFactId?: string,
  resolutionSource?: FactConflictResolutionSource,
): FactConflict {
  return {
    status,
    reason,
    competingFacts: [existing.id, incoming.id],
    ...(selectedFactId ? { selectedFactId } : {}),
    ...(resolutionSource ? { resolutionSource } : {}),
  };
}

export function resolveFactConflict(existing: Fact, incoming: Fact): ConflictResolution {
  if (existing.value === incoming.value) {
    return { winner: 'existing', reason: 'same_value' };
  }

  const existingTier = maxEvidenceTier(existing.provenance);
  const incomingTier = maxEvidenceTier(incoming.provenance);

  if (existingTier > incomingTier) {
    return { winner: 'existing', reason: 'higher_evidence_tier' };
  }
  if (incomingTier > existingTier) {
    return { winner: 'incoming', reason: 'higher_evidence_tier' };
  }

  const existingScore = scoreFromProvenance(existing.provenance);
  const incomingScore = scoreFromProvenance(incoming.provenance);

  if (existingScore > incomingScore + CONFIDENCE_GAP) {
    return { winner: 'existing', reason: 'higher_confidence' };
  }
  if (incomingScore > existingScore + CONFIDENCE_GAP) {
    return { winner: 'incoming', reason: 'higher_confidence' };
  }

  return { winner: 'conflict', reason: 'unresolvable_conflict' };
}
