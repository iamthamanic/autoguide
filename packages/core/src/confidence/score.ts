/**
 * @autoguide/core — confidence scoring from evidence hierarchy.
 */

import type { Provenance, ProvenanceSource } from '../types/fact.js';

const SOURCE_WEIGHT: Record<ProvenanceSource, number> = {
  developer_review: 1.0,
  config: 0.98,
  plugin: 0.95,
  source_code: 0.9,
  accessibility_tree: 0.88,
  runtime_dom: 0.85,
  playwright_trace: 0.87,
  ai_enrichment: 0.55,
};

export const REVIEW_THRESHOLD = 0.7;
export const PUBLISHED_THRESHOLD = 0.85;

export function scoreFromProvenance(provenance: Provenance[]): number {
  if (provenance.length === 0) return 0;
  const best = provenance.reduce((max, item) => {
    const weight = SOURCE_WEIGHT[item.source] ?? 0.5;
    const value = Math.min(1, weight * item.confidence);
    return Math.max(max, value);
  }, 0);
  return Math.round(best * 100) / 100;
}

export function needsReview(confidence: number): boolean {
  return confidence < REVIEW_THRESHOLD;
}

export function isDestructiveActionKey(key: string): boolean {
  return /delete|remove|destroy|approve|reject|submit/i.test(key);
}

export function minimumConfidenceForKey(key: string): number {
  return isDestructiveActionKey(key) ? 0.9 : REVIEW_THRESHOLD;
}
