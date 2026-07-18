/**
 * @iamthamanic/autoguide-react — dev-only confidence and provenance badge for facts.
 */

import type { Fact } from '@iamthamanic/autoguide-core';
import { getReviewBadgeState, type ReviewBadgeSurface } from '@iamthamanic/autoguide-ui';

export interface ReviewBadgeProps {
  fact: Fact;
  mode: 'development' | 'published';
  /** Help uses „Vorschlag“; Review keeps „Prüfen“. */
  surface?: ReviewBadgeSurface;
}

export function ReviewBadge({ fact, mode, surface = 'review' }: ReviewBadgeProps) {
  const state = getReviewBadgeState(fact, mode, surface);
  if (!state.visible) return null;

  return (
    <span
      title={state.title}
      style={{
        marginLeft: 6,
        fontSize: 12,
        fontWeight: 600,
        color: `var(${state.colorVar})`,
      }}
    >
      ({state.label})
    </span>
  );
}
