import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { render, fireEvent } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import type { Fact } from '@iamthamanic/autoguide-core';
import AutoGuideWidget from './AutoGuideWidget.svelte';
import FlowStepList from './FlowStepList.svelte';
import ReviewBadge from './ReviewBadge.svelte';
import TestHarness from './TestHarness.svelte';

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

describe('@iamthamanic/autoguide-svelte', () => {
  const distDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');

  it('emits compiled adapter artifacts', () => {
    expect(existsSync(join(distDir, 'index.js'))).toBe(true);
    expect(existsSync(join(distDir, 'AutoGuideWidget.svelte'))).toBe(true);
  });

  it('renders widget without throwing when docs are missing', () => {
    const { getByLabelText } = render(TestHarness, { props: { appId: 'demo' } });
    expect(getByLabelText('Hilfe öffnen')).toBeTruthy();
  });

  it('resolves route context in help panel title', async () => {
    const { getByLabelText, getByText } = render(TestHarness, {
      props: {
        appId: 'demo',
        route: '/vacation',
        pages: [
          {
            id: 'p1',
            route: '/vacation',
            title: 'Urlaub',
            roleIds: [],
            elementIds: [],
            featureIds: [],
            flowIds: [],
            factIds: [],
            status: 'draft',
          },
        ],
        flows: [
          {
            id: 'fl1',
            title: 'Urlaub beantragen',
            steps: [
              { order: 1, title: 'Antrag öffnen', factIds: [] },
              { order: 2, title: 'Absenden', factIds: [] },
            ],
            roleIds: [],
            pageIds: ['p1'],
            factIds: [],
            status: 'draft',
          },
        ],
      },
    });
    await fireEvent.click(getByLabelText('Hilfe öffnen'));
    expect(getByText(/Hilfe: Urlaub/)).toBeTruthy();
    expect(getByText('Antrag öffnen')).toBeTruthy();
  });

  it('shows loading skeleton with aria-busy', async () => {
    const { getByLabelText, getByRole } = render(TestHarness, {
      props: { appId: 'demo', loading: true },
    });
    await fireEvent.click(getByLabelText('Hilfe öffnen'));
    expect(getByRole('dialog').getAttribute('aria-busy')).toBe('true');
  });

  it('shows error state with retry', async () => {
    const onRetry = vi.fn();
    const { getByLabelText, getByRole } = render(TestHarness, {
      props: { appId: 'demo', error: 'Dokumentation konnte nicht geladen werden.', onRetry },
    });
    await fireEvent.click(getByLabelText('Hilfe öffnen'));
    await fireEvent.click(getByRole('button', { name: 'Erneut versuchen' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('renders ReviewBadge in development mode', () => {
    const { getByText } = render(ReviewBadge, {
      props: { fact: sampleFacts[0]!, mode: 'development' },
    });
    expect(getByText(/Prüfen/)).toBeTruthy();
  });

  it('renders FlowStepList with ordered steps', () => {
    const { container } = render(FlowStepList, {
      props: {
        flow: {
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
        },
      },
    });
    const text = container.textContent ?? '';
    expect(text.indexOf('Erster')).toBeLessThan(text.indexOf('Zweiter'));
  });
});
