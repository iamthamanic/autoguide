import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Fact } from '@autoguide/core';
import { AutoGuideProvider, AutoGuideWidget } from './index.js';

const sampleFacts: Fact[] = [
  {
    id: 'f1',
    entityId: 'btn-save',
    key: 'action',
    value: 'Speichern',
    status: 'needs_review',
    reviewStatus: 'pending',
    confidence: 0.6,
    provenance: [],
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
            steps: [{ order: 1, title: 'Antrag öffnen', factIds: [] }],
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
});
