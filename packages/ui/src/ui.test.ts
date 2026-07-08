import { describe, expect, it } from 'vitest';
import { agTokenCssVars, AG_DESIGN_TOKENS } from './tokens.js';
import { getReviewBadgeState } from './review-badge.js';
import { listOrderedFlowSteps } from './flow-steps.js';
import { resolveWidgetPanelStatus } from './widget-state.js';
import type { Fact, FlowRecord } from '@autoguide/core';

const fact: Fact = {
  id: 'f1',
  entityId: 'btn',
  key: 'label',
  value: 'Save',
  status: 'needs_review',
  reviewStatus: 'pending',
  confidence: 0.6,
  provenance: [{ source: 'runtime_dom', confidence: 0.6, observedAt: '2026-01-01T00:00:00.000Z' }],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('@autoguide/ui tokens', () => {
  it('exposes css variable map', () => {
    const vars = agTokenCssVars();
    expect(vars['--ag-primary']).toBe(AG_DESIGN_TOKENS.primary);
  });
});

describe('@autoguide/ui review badge', () => {
  it('hides in published mode', () => {
    expect(getReviewBadgeState(fact, 'published').visible).toBe(false);
  });

  it('shows label in development for low confidence', () => {
    const state = getReviewBadgeState(fact, 'development');
    expect(state.visible).toBe(true);
    expect(state.label).toBe('Prüfen');
  });
});

describe('@autoguide/ui flow steps', () => {
  it('orders steps by order field', () => {
    const flow: FlowRecord = {
      id: 'flow-1',
      title: 'Test',
      roleIds: [],
      steps: [
        { id: 's2', order: 2, title: 'Zwei' },
        { id: 's1', order: 1, title: 'Eins' },
      ],
      status: 'draft',
    };
    expect(listOrderedFlowSteps(flow).map((step) => step.order)).toEqual([1, 2]);
  });
});

describe('@autoguide/ui widget state', () => {
  it('resolves loading before error and empty', () => {
    expect(resolveWidgetPanelStatus({ loading: true, hasContent: false }).state).toBe('loading');
    expect(resolveWidgetPanelStatus({ error: 'x', hasContent: true }).state).toBe('error');
    expect(resolveWidgetPanelStatus({ hasContent: false }).state).toBe('empty');
    expect(resolveWidgetPanelStatus({ hasContent: true }).state).toBe('ready');
  });
});
