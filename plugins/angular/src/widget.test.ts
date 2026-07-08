import { existsSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import type { Fact } from '@autoguide/core';
import { getReviewBadgeState, listOrderedFlowSteps } from '@autoguide/ui';
import { AutoGuideContextService } from './context.js';

const sampleFacts: Fact[] = [
  {
    id: 'f1',
    entityId: 'btn-save',
    key: 'action',
    value: 'Speichern',
    status: 'needs_review',
    reviewStatus: 'pending',
    confidence: 0.6,
    provenance: [{ source: 'runtime_dom', confidence: 0.6, observedAt: '2026-01-01T00:00:00.000Z' }],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'f2',
    entityId: 'btn-export',
    key: 'action',
    value: 'Exportieren',
    status: 'verified',
    reviewStatus: 'approved',
    confidence: 0.92,
    provenance: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

describe('@autoguide/angular', () => {
  it('emits compiled adapter artifacts', () => {
    expect(existsSync(new URL('../dist/index.js', import.meta.url))).toBe(true);
    expect(existsSync(new URL('../dist/autoguide-widget.component.js', import.meta.url))).toBe(true);
    expect(existsSync(new URL('../dist/review-badge.component.js', import.meta.url))).toBe(true);
    expect(existsSync(new URL('../dist/flow-step-list.component.js', import.meta.url))).toBe(true);
    expect(existsSync(new URL('../dist/panel-skeleton.component.js', import.meta.url))).toBe(true);
  });

  it('stores provider inputs in context service', () => {
    const ctx = new AutoGuideContextService();
    ctx.appId = 'demo';
    ctx.route = '/vacation';
    ctx.mode = 'published';
    ctx.loading = true;
    ctx.error = 'Fehler';
    ctx.onRetry = vi.fn();
    expect(ctx.appId).toBe('demo');
    expect(ctx.route).toBe('/vacation');
    expect(ctx.mode).toBe('published');
    expect(ctx.loading).toBe(true);
    expect(ctx.error).toBe('Fehler');
    expect(ctx.onRetry).toBeTypeOf('function');
  });

  it('uses shared ReviewBadge state in development mode', () => {
    const state = getReviewBadgeState(sampleFacts[0]!, 'development');
    expect(state.visible).toBe(true);
    expect(state.label).toBe('Prüfen');
  });

  it('orders flow steps via shared headless primitive', () => {
    const steps = listOrderedFlowSteps({
      id: 'fl1',
      title: 'Test',
      steps: [
        { order: 2, title: 'Zweiter Schritt', factIds: [] },
        { order: 1, title: 'Erster Schritt', factIds: [] },
      ],
      roleIds: [],
      pageIds: [],
      factIds: [],
      status: 'draft',
    });
    expect(steps[0]?.title).toBe('Erster Schritt');
    expect(steps[1]?.title).toBe('Zweiter Schritt');
  });

  it('widget template includes styleguide markers', async () => {
    const source = await import('node:fs/promises').then((fs) =>
      fs.readFile(new URL('./autoguide-widget.component.ts', import.meta.url), 'utf8'),
    );
    expect(source).toContain('ag-panel-skeleton');
    expect(source).toContain('ag-flow-step-list');
    expect(source).toContain('ag-review-badge');
    expect(source).toContain('aria-expanded');
    expect(source).toContain('bindFocusTrap');
    expect(source).toContain('agTokenCssVars');
  });
});
