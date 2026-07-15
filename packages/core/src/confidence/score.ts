/**
 * @iamthamanic/autoguide-core — confidence scoring from evidence hierarchy (v2).
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

/** Evidence tier for conflict resolution (higher wins). */
const EVIDENCE_TIER: Record<ProvenanceSource, number> = {
  developer_review: 9,
  config: 8,
  plugin: 7,
  source_code: 6,
  accessibility_tree: 5,
  playwright_trace: 4,
  runtime_dom: 4,
  ai_enrichment: 1,
};

type CorroborationFamily = 'static' | 'runtime' | 'behavior';

const CORROBORATION_FAMILY: Partial<Record<ProvenanceSource, CorroborationFamily>> = {
  source_code: 'static',
  accessibility_tree: 'static',
  runtime_dom: 'runtime',
  playwright_trace: 'behavior',
};

export const REVIEW_THRESHOLD = 0.7;
export const PUBLISHED_THRESHOLD = 0.85;

const CORROBORATION_STEP = 0.04;
const MAX_CORROBORATION_BONUS = 0.09;
const AI_ONLY_PENALTY = 0.1;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function provenanceWeight(item: Provenance): number {
  const weight = SOURCE_WEIGHT[item.source] ?? 0.5;
  return Math.min(1, weight * item.confidence);
}

function corroborationFamilies(provenance: Provenance[]): Set<CorroborationFamily> {
  const families = new Set<CorroborationFamily>();
  for (const item of provenance) {
    const family = CORROBORATION_FAMILY[item.source];
    if (family) families.add(family);
  }
  return families;
}

function calculateCorroborationBonus(provenance: Provenance[]): number {
  const families = corroborationFamilies(provenance);
  if (families.size <= 1) return 0;
  return Math.min(MAX_CORROBORATION_BONUS, (families.size - 1) * CORROBORATION_STEP);
}

function calculateAmbiguityPenalty(provenance: Provenance[]): number {
  if (provenance.length === 0) return 0;
  const best = provenance.reduce(
    (max, item) => Math.max(max, EVIDENCE_TIER[item.source] ?? 0),
    0,
  );
  const onlyAi = provenance.every((item) => item.source === 'ai_enrichment');
  if (onlyAi) return AI_ONLY_PENALTY;
  if (best <= EVIDENCE_TIER.ai_enrichment && provenance.length === 1) return AI_ONLY_PENALTY;
  return 0;
}

export function maxEvidenceTier(provenance: Provenance[]): number {
  if (provenance.length === 0) return 0;
  return provenance.reduce((max, item) => Math.max(max, EVIDENCE_TIER[item.source] ?? 0), 0);
}

export function scoreFromProvenance(provenance: Provenance[]): number {
  if (provenance.length === 0) return 0;
  const base = provenance.reduce((max, item) => Math.max(max, provenanceWeight(item)), 0);
  const corroboration = calculateCorroborationBonus(provenance);
  const penalty = calculateAmbiguityPenalty(provenance);
  return Math.round(clamp(base + corroboration - penalty, 0, 1) * 100) / 100;
}

export function needsReview(confidence: number): boolean {
  return confidence < REVIEW_THRESHOLD;
}

export function isDestructiveActionKey(key: string): boolean {
  return /delete|remove|destroy|approve|reject|submit|archive|revoke|terminate|deactivate|cancel|reset|löschen|entfernen/i.test(
    key,
  );
}

export function minimumConfidenceForKey(key: string): number {
  return isDestructiveActionKey(key) ? 0.9 : REVIEW_THRESHOLD;
}
