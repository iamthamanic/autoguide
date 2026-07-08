/**
 * @autoguide/core — re-verify developer edits against scan evidence.
 */

import type { Fact } from '../types/fact.js';
import type { Recommendation } from '../recommendations/types.js';
import type { ReviewAction } from './types.js';

export interface VerificationResult {
  action: ReviewAction;
  supported: boolean;
}

function normalizeValue(value: unknown): string {
  return String(value ?? '').trim().toLowerCase();
}

function evidenceValuesFor(fact: Fact, scannedFacts: Fact[]): unknown[] {
  const sameKey = scannedFacts.filter(
    (candidate) =>
      candidate.entityId === fact.entityId &&
      candidate.key === fact.key &&
      candidate.status !== 'manual_override' &&
      candidate.id !== fact.id,
  );
  return [fact.value, ...sameKey.map((item) => item.value)];
}

export function verifyEditedFact(
  fact: Fact,
  editedValue: unknown,
  scannedFacts: Fact[],
): VerificationResult {
  if (normalizeValue(editedValue) === normalizeValue(fact.value)) {
    return { action: 'accepted', supported: true };
  }

  const evidence = evidenceValuesFor(fact, scannedFacts);
  const supported = evidence.some((value) => normalizeValue(value) === normalizeValue(editedValue));
  if (supported) {
    return { action: 'verified_after_edit', supported: true };
  }

  return { action: 'unsupported_manual_knowledge', supported: false };
}

export function recommendationForUnsupportedEdit(fact: Fact, editedValue: unknown): Recommendation {
  return {
    id: `rec-unsupported-${fact.id}`,
    target: `${fact.entityId} · ${fact.key}`,
    category: 'documentation',
    severity: 'warning',
    message: 'Manuelle Änderung ohne Scan-Evidenz',
    rationale:
      `Der Wert „${String(editedValue)}“ konnte nicht gegen Quellcode oder Runtime belegt werden. ` +
      'Ergänze Metadaten, Labels oder Tests.',
    filePath: fact.provenance.find((item) => item.filePath)?.filePath,
  };
}
