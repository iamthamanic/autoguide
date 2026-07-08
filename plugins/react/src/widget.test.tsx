import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Fact } from '@autoguide/core';
import { AutoGuideProvider } from './AutoGuideProvider.js';
import { AutoGuideWidget } from './AutoGuideWidget.js';
import { FlowStepList } from './FlowStepList.js';
import { ReviewBadge } from './ReviewBadge.js';

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

describe('@autoguide/react', () => {
  it('renders widget without throwing when docs are missing', () => {
    render(
      <AutoGuideProvider appId="demo">
        <AutoGuideWidget />
      </AutoGuideProvider>,
    );
    expect(screen.getByLabelText('Hilfe öffnen')).toBeTruthy();
  });

  it('resolves route context in help panel title', () => {
    render(
      <AutoGuideProvider
        appId="demo"
        route="/vacation"
        pages={[
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
        ]}
        flows={[
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
        ]}
      >
        <AutoGuideWidget />
      </AutoGuideProvider>,
    );
    fireEvent.click(screen.getByLabelText('Hilfe öffnen'));
    expect(screen.getByRole('heading', { name: /Hilfe: Urlaub/ })).toBeTruthy();
    expect(screen.getByText('Urlaub beantragen')).toBeTruthy();
    expect(screen.getByText('Antrag öffnen')).toBeTruthy();
    expect(screen.getByText('2')).toBeTruthy();
  });

  it('shows uncertain facts only in published mode', () => {
    render(
      <AutoGuideProvider appId="demo" mode="published" facts={sampleFacts}>
        <AutoGuideWidget />
      </AutoGuideProvider>,
    );
    fireEvent.click(screen.getByLabelText('Hilfe öffnen'));
    expect(screen.getByText(/Exportieren/)).toBeTruthy();
    expect(screen.queryByText(/Speichern/)).toBeNull();
  });

  it('shows loading skeleton with aria-busy', () => {
    render(
      <AutoGuideProvider appId="demo" loading>
        <AutoGuideWidget />
      </AutoGuideProvider>,
    );
    fireEvent.click(screen.getByLabelText('Hilfe öffnen'));
    expect(screen.getByRole('dialog').getAttribute('aria-busy')).toBe('true');
  });

  it('shows error state with retry', () => {
    const onRetry = vi.fn();
    render(
      <AutoGuideProvider appId="demo" error="Dokumentation konnte nicht geladen werden." onRetry={onRetry}>
        <AutoGuideWidget />
      </AutoGuideProvider>,
    );
    fireEvent.click(screen.getByLabelText('Hilfe öffnen'));
    expect(screen.getByRole('alert')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Erneut versuchen' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('closes panel on Escape', () => {
    render(
      <AutoGuideProvider appId="demo">
        <AutoGuideWidget />
      </AutoGuideProvider>,
    );
    fireEvent.click(screen.getByLabelText('Hilfe öffnen'));
    expect(screen.getByRole('dialog')).toBeTruthy();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('renders ReviewBadge in development mode', () => {
    render(<ReviewBadge fact={sampleFacts[0]!} mode="development" />);
    expect(screen.getByText(/Prüfen/)).toBeTruthy();
  });

  it('renders FlowStepList with ordered steps', () => {
    render(
      <FlowStepList
        flow={{
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
        }}
      />,
    );
    const items = screen.getAllByText(/Schritt/);
    expect(items[0]?.textContent).toContain('Erster');
  });
});
