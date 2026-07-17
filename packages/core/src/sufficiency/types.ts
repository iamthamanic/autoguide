/**
 * @iamthamanic/autoguide-core — scan evidence sufficiency gate.
 * Location: packages/core/src/sufficiency/types.ts
 *
 * Evaluates whether post-analyze evidence is enough for help/tours,
 * or whether crawl/runtime escalation is needed.
 */

export type SufficiencyStatus = 'sufficient' | 'escalate' | 'blocked';

export interface SufficiencyEvidence {
  orderedFlowCount: number;
  interactiveFactCount: number;
  pageCount: number;
  factCount: number;
}

/**
 * Pragmatic YAGNI thresholds (documented for autonomy escalate path).
 *
 * sufficient when:
 *   - ≥ minOrderedFlows ordered flows (steps.length ≥ 1), OR
 *   - ≥ minInteractiveFacts interactive facts AND ≥ minPages pages
 *
 * escalate when not sufficient but some pages or facts exist
 *   (crawl/runtime can improve coverage)
 *
 * blocked when no pages and no facts (nothing to escalate from)
 */
export interface SufficiencyCriteria {
  minOrderedFlows: number;
  minInteractiveFacts: number;
  minPages: number;
}

export interface SufficiencyReason {
  code: string;
  messageDe: string;
}

export interface SufficiencyReport {
  status: SufficiencyStatus;
  reasons: SufficiencyReason[];
  evidence: SufficiencyEvidence;
  criteria: SufficiencyCriteria;
  evaluatedAt: string;
}

export const DEFAULT_SUFFICIENCY_CRITERIA: SufficiencyCriteria = {
  minOrderedFlows: 1,
  minInteractiveFacts: 3,
  minPages: 1,
};
