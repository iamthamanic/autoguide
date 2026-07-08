/**
 * @autoguide/react — dev-only confidence and provenance badge for facts.
 */

import type { Fact } from '@autoguide/core';

export interface ReviewBadgeProps {
  fact: Fact;
  mode: 'development' | 'published';
}

function provenanceLabel(fact: Fact): string {
  if (fact.provenance.length === 0) return 'Keine Provenance';
  return fact.provenance
    .map((item) => item.source.replace(/_/g, ' '))
    .join(', ');
}

export function ReviewBadge({ fact, mode }: ReviewBadgeProps) {
  if (mode !== 'development') return null;
  if (fact.confidence >= 0.85 && fact.reviewStatus === 'approved') return null;

  const tone =
    fact.confidence >= 0.85
      ? 'var(--ag-success)'
      : fact.confidence >= 0.5
        ? 'var(--ag-warning)'
        : 'var(--ag-warning)';

  const label =
    fact.reviewStatus === 'approved'
      ? 'Verifiziert'
      : fact.confidence < 0.5
        ? 'Unsicher'
        : 'Prüfen';

  return (
    <span
      title={`Confidence: ${Math.round(fact.confidence * 100)}% — ${provenanceLabel(fact)}`}
      style={{
        marginLeft: 6,
        fontSize: 12,
        fontWeight: 600,
        color: tone,
      }}
    >
      ({label})
    </span>
  );
}
