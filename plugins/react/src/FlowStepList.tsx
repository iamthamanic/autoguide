/**
 * @iamthamanic/autoguide-react — numbered flow steps for Help Widget panel.
 */

import type { FlowRecord } from '@iamthamanic/autoguide-core';
import { listOrderedFlowSteps } from '@iamthamanic/autoguide-ui';

export interface FlowStepListProps {
  flow: FlowRecord;
}

export function FlowStepList({ flow }: FlowStepListProps) {
  const steps = listOrderedFlowSteps(flow);

  return (
    <ol
      style={{
        margin: '0 0 12px',
        paddingLeft: 0,
        listStyle: 'none',
        fontSize: 14,
        color: 'var(--ag-text)',
      }}
    >
      {steps.map((step) => (
        <li
          key={`${flow.id}-${step.order}`}
          style={{
            display: 'flex',
            gap: 10,
            marginBottom: 8,
            alignItems: 'flex-start',
          }}
        >
          <span
            aria-hidden
            style={{
              flexShrink: 0,
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: 'var(--ag-surface-muted)',
              border: '1px solid var(--ag-border)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--ag-primary)',
            }}
          >
            {step.order}
          </span>
          <span>
            <strong>{step.title}</strong>
            {step.description ? (
              <span style={{ display: 'block', color: 'var(--ag-text-muted)', fontSize: 12 }}>
                {step.description}
              </span>
            ) : null}
          </span>
        </li>
      ))}
    </ol>
  );
}
