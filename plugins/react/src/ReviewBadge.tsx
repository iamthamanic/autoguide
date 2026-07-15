/**
 * @iamthamanic/autoguide-react — dev-only confidence and provenance badge for facts.
 */

import type { Fact } from '@iamthamanic/autoguide-core';
import { getReviewBadgeState } from '@iamthamanic/autoguide-ui';

export interface ReviewBadgeProps {
  fact: Fact;
  mode: 'development' | 'published';
}

export function ReviewBadge({ fact, mode }: ReviewBadgeProps) {
  const state = getReviewBadgeState(fact, mode);
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
