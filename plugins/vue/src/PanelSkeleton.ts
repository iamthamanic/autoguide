/**
 * @iamthamanic/autoguide-vue — loading skeleton for Help Widget panel.
 */

import { defineComponent, h } from 'vue';

function skeletonLine(width: string) {
  return h('div', {
    style: {
      height: '12px',
      width,
      borderRadius: '4px',
      background: 'var(--ag-surface-muted)',
      marginBottom: '10px',
    },
  });
}

export const PanelSkeleton = defineComponent({
  name: 'PanelSkeleton',
  setup() {
    return () => h('div', { 'aria-hidden': 'true' }, [skeletonLine('70%'), skeletonLine('100%'), skeletonLine('85%')]);
  },
});
