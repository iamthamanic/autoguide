/**
 * @iamthamanic/autoguide-vue — dev-only confidence and provenance badge for facts.
 */

import { defineComponent, h, type PropType } from 'vue';
import type { Fact, VisibilityMode } from '@iamthamanic/autoguide-core';
import { getReviewBadgeState } from '@iamthamanic/autoguide-ui';

export const ReviewBadge = defineComponent({
  name: 'ReviewBadge',
  props: {
    fact: { type: Object as PropType<Fact>, required: true },
    mode: { type: String as PropType<VisibilityMode>, required: true },
  },
  setup(props) {
    return () => {
      const state = getReviewBadgeState(props.fact, props.mode);
      if (!state.visible) return null;
      return h(
        'span',
        {
          title: state.title,
          style: {
            marginLeft: '6px',
            fontSize: '12px',
            fontWeight: 600,
            color: `var(${state.colorVar})`,
          },
        },
        `(${state.label})`,
      );
    };
  },
});
