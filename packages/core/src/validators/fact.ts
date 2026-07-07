/**
 * @autoguide/core — runtime validators for facts and provenance.
 * Location: packages/core/src/validators/fact.ts
 */

import {
  FACT_STATUSES,
  PROVENANCE_SOURCES,
  type Fact,
  type FactStatus,
  type Provenance,
  type ProvenanceSource,
  type ReviewStatus,
} from '../types/fact.js';

const REVIEW_STATUSES: readonly ReviewStatus[] = ['pending', 'approved', 'rejected'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isProvenanceSource(value: unknown): value is ProvenanceSource {
  return typeof value === 'string' && (PROVENANCE_SOURCES as readonly string[]).includes(value);
}

export function isFactStatus(value: unknown): value is FactStatus {
  return typeof value === 'string' && (FACT_STATUSES as readonly string[]).includes(value);
}

export function isReviewStatus(value: unknown): value is ReviewStatus {
  return typeof value === 'string' && (REVIEW_STATUSES as readonly string[]).includes(value);
}

export function isProvenance(value: unknown): value is Provenance {
  if (!isRecord(value)) return false;
  if (!isProvenanceSource(value.source)) return false;
  if (typeof value.confidence !== 'number') return false;
  if (typeof value.observedAt !== 'string') return false;
  return true;
}

export function isFact(value: unknown): value is Fact {
  if (!isRecord(value)) return false;
  if (typeof value.id !== 'string') return false;
  if (typeof value.entityId !== 'string') return false;
  if (typeof value.key !== 'string') return false;
  if (
    value.roleIds !== undefined &&
    (!Array.isArray(value.roleIds) || !value.roleIds.every((item) => typeof item === 'string'))
  ) {
    return false;
  }
  if (value.sourceVersion !== undefined && typeof value.sourceVersion !== 'string') return false;
  if (!isFactStatus(value.status)) return false;
  if (!isReviewStatus(value.reviewStatus)) return false;
  if (typeof value.confidence !== 'number') return false;
  if (!Array.isArray(value.provenance) || !value.provenance.every(isProvenance)) return false;
  if (typeof value.createdAt !== 'string') return false;
  if (typeof value.updatedAt !== 'string') return false;
  return true;
}

export function assertFact(value: unknown): asserts value is Fact {
  if (!isFact(value)) {
    throw new Error('Invalid Fact shape');
  }
}

/** Manual overrides and verified facts outrank AI proposals for merge precedence. */
export function factPrecedence(status: FactStatus): number {
  switch (status) {
    case 'manual_override':
      return 100;
    case 'verified':
      return 90;
    case 'needs_review':
      return 50;
    case 'ai_proposal':
      return 30;
    case 'conflict':
      return 20;
    case 'stale':
      return 10;
    default:
      return 0;
  }
}

/** Published mode: approved facts with confidence >= threshold only. */
export function isVisibleInPublishedMode(fact: Fact, minConfidence = 0.85): boolean {
  return fact.reviewStatus === 'approved' && fact.confidence >= minConfidence;
}
