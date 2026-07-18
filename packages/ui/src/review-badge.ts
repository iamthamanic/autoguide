/**
 * @iamthamanic/autoguide-ui — headless ReviewBadge state (shared across adapters).
 */

import type { Fact, VisibilityMode } from '@iamthamanic/autoguide-core';
import type { AgCssVar } from './tokens.js';

export type ReviewBadgeSurface = 'review' | 'help';

export interface ReviewBadgeState {
  visible: boolean;
  label: string;
  colorVar: AgCssVar;
  title: string;
}

function provenanceLabel(fact: Fact): string {
  if (fact.provenance.length === 0) return 'Keine Provenance';
  return fact.provenance.map((item) => item.source.replace(/_/g, ' ')).join(', ');
}

export function getReviewBadgeState(
  fact: Fact,
  mode: VisibilityMode,
  surface: ReviewBadgeSurface = 'review',
): ReviewBadgeState {
  const title = `Confidence: ${Math.round(fact.confidence * 100)}% — ${provenanceLabel(fact)}`;

  if (mode !== 'development') {
    return { visible: false, label: '', colorVar: '--ag-warning', title };
  }
  if (fact.confidence >= 0.85 && fact.reviewStatus === 'approved') {
    return { visible: false, label: '', colorVar: '--ag-success', title };
  }

  const colorVar: AgCssVar =
    fact.confidence >= 0.85 ? '--ag-success' : '--ag-warning';

  const pendingLabel = surface === 'help' ? 'Vorschlag' : 'Prüfen';

  const label =
    fact.reviewStatus === 'approved'
      ? 'Verifiziert'
      : fact.confidence < 0.5
        ? 'Unsicher'
        : pendingLabel;

  return { visible: true, label, colorVar, title };
}
