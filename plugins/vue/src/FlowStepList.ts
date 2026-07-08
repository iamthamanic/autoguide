/**
 * @autoguide/vue — numbered flow steps for Help Widget panel.
 */

import { defineComponent, h, type PropType } from 'vue';
import type { FlowRecord } from '@autoguide/core';
import { listOrderedFlowSteps } from '@autoguide/ui';

export const FlowStepList = defineComponent({
  name: 'FlowStepList',
  props: {
    flow: { type: Object as PropType<FlowRecord>, required: true },
  },
  setup(props) {
    return () => {
      const steps = listOrderedFlowSteps(props.flow);
      return h(
        'ol',
        {
          style: {
            margin: '0 0 12px',
            paddingLeft: 0,
            listStyle: 'none',
            fontSize: '14px',
            color: 'var(--ag-text)',
          },
        },
        steps.map((step) =>
          h(
            'li',
            {
              key: `${props.flow.id}-${step.order}`,
              style: {
                display: 'flex',
                gap: '10px',
                marginBottom: '8px',
                alignItems: 'flex-start',
              },
            },
            [
              h(
                'span',
                {
                  'aria-hidden': 'true',
                  style: {
                    flexShrink: 0,
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: 'var(--ag-surface-muted)',
                    border: '1px solid var(--ag-border)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'var(--ag-primary)',
                  },
                },
                String(step.order),
              ),
              h('span', [
                h('strong', step.title),
                step.description
                  ? h(
                      'span',
                      {
                        style: {
                          display: 'block',
                          color: 'var(--ag-text-muted)',
                          fontSize: '12px',
                        },
                      },
                      step.description,
                    )
                  : null,
              ]),
            ],
          ),
        ),
      );
    };
  },
});
