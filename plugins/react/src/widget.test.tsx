import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Fact, Tour } from '@iamthamanic/autoguide-core';
import { AutoGuideBar } from './AutoGuideBar.js';
import { AutoGuideProvider } from './AutoGuideProvider.js';
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

const sampleTour: Tour = {
  id: 'tour-1',
  title: 'Demo Tour',
  description: 'Test',
  roleIds: [],
  status: 'published',
  steps: [{ id: 's1', title: 'Step', body: 'Body', action: 'observe' }],
};

describe('@iamthamanic/autoguide-react', () => {
  it('opens inspect from dev settings menu', () => {
    render(
      <AutoGuideProvider appId="demo" mode="development">
        <AutoGuideBar features={{ widget: true, inspector: true }} />
      </AutoGuideProvider>,
    );
    expect(screen.queryByLabelText('Inspect')).toBeNull();
    fireEvent.click(screen.getByLabelText('Entwickler-Menü'));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Element inspizieren' }));
    expect(screen.getByLabelText('Entwickler-Menü').getAttribute('aria-expanded')).toBe('false');
  });

  it('lists review in dev settings menu even when queue is empty', () => {
    render(
      <AutoGuideProvider appId="demo" mode="development" reviews={[]}>
        <AutoGuideBar features={{ widget: true, inspector: true }} />
      </AutoGuideProvider>,
    );
    fireEvent.click(screen.getByLabelText('Entwickler-Menü'));
    expect(screen.getByRole('menuitem', { name: 'Review-Warteschlange öffnen' })).toBeTruthy();
    fireEvent.click(screen.getByRole('menuitem', { name: 'Review-Warteschlange öffnen' }));
    expect(screen.getByRole('dialog', { name: 'Review-Warteschlange' })).toBeTruthy();
    expect(screen.getByText(/Keine offenen Reviews/)).toBeTruthy();
  });

  it('shows scan in dev settings menu and triggers dev scan endpoint', async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({ ok: true, message: 'Scan abgeschlossen.' }),
    }));
    vi.stubGlobal('fetch', fetchMock);
    const onRetry = vi.fn();

    render(
      <AutoGuideProvider appId="demo" mode="development" onRetry={onRetry}>
        <AutoGuideBar features={{ widget: true }} />
      </AutoGuideProvider>,
    );

    fireEvent.click(screen.getByLabelText('Entwickler-Menü'));
    await act(async () => {
      fireEvent.click(screen.getByRole('menuitem', { name: 'Dokumentation neu scannen' }));
    });

    expect(fetchMock).toHaveBeenCalledWith(
      '/__autoguide/scan',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(onRetry).toHaveBeenCalled();
    expect(screen.getByRole('status').textContent).toContain('Scan abgeschlossen');

    vi.unstubAllGlobals();
  });

  it('auto-dismisses scan toast after 5s and on click', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        ok: true,
        message: 'Scan abgeschlossen. Dokumentation wurde aktualisiert.',
      }),
    }));
    vi.stubGlobal('fetch', fetchMock);

    render(
      <AutoGuideProvider appId="demo" mode="development">
        <AutoGuideBar features={{ widget: true }} />
      </AutoGuideProvider>,
    );

    fireEvent.click(screen.getByLabelText('Entwickler-Menü'));
    await act(async () => {
      fireEvent.click(screen.getByRole('menuitem', { name: 'Dokumentation neu scannen' }));
      await Promise.resolve();
    });

    expect(
      screen.getByText('Scan abgeschlossen. Dokumentation wurde aktualisiert.'),
    ).toBeTruthy();

    await act(async () => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.queryByRole('status')).toBeNull();

    fireEvent.click(screen.getByLabelText('Entwickler-Menü'));
    await act(async () => {
      fireEvent.click(screen.getByRole('menuitem', { name: 'Dokumentation neu scannen' }));
      await Promise.resolve();
    });
    fireEvent.click(screen.getByRole('status'));
    expect(screen.queryByRole('status')).toBeNull();

    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('renders a visible grip drag handle', () => {
    render(
      <AutoGuideProvider appId="demo" mode="development">
        <AutoGuideBar features={{ widget: true }} />
      </AutoGuideProvider>,
    );
    const handle = screen.getByRole('button', { name: /Dock verschieben/ });
    expect(handle.className).toContain('ag-dock-drag-handle');
    expect(handle.querySelector('.ag-dock-drag-handle__grip')).toBeTruthy();
    expect(handle.textContent).toContain('AutoGuide');
  });

  it('shows tour button when tours feature is enabled', () => {
    render(
      <AutoGuideProvider appId="demo" mode="development" tours={[sampleTour]}>
        <AutoGuideBar features={{ widget: true, tours: true }} />
      </AutoGuideProvider>,
    );
    expect(screen.getByLabelText('Tour starten: Demo Tour')).toBeTruthy();
  });

  it('renders widget without throwing when docs are missing', () => {
    render(
      <AutoGuideProvider appId="demo">
        <AutoGuideBar features={{ widget: true }} />
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
        <AutoGuideBar features={{ widget: true }} />
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
        <AutoGuideBar features={{ widget: true }} />
      </AutoGuideProvider>,
    );
    fireEvent.click(screen.getByLabelText('Hilfe öffnen'));
    expect(screen.getByText(/Exportieren/)).toBeTruthy();
    expect(screen.queryByText(/Speichern/)).toBeNull();
  });

  it('lists actionable German reasons when help is empty', () => {
    render(
      <AutoGuideProvider appId="demo" mode="published" facts={[]} pages={[]} flows={[]}>
        <AutoGuideBar features={{ widget: true }} />
      </AutoGuideProvider>,
    );
    fireEvent.click(screen.getByLabelText('Hilfe öffnen'));
    expect(screen.getByText('Keine Dokumentation für diese Seite.')).toBeTruthy();
    expect(screen.getByText(/Doc-Bundle fehlt/)).toBeTruthy();
    expect(screen.getByText(/playwright-import/)).toBeTruthy();
    expect(screen.getAllByText(/autoguide sync/).length).toBeGreaterThanOrEqual(1);
  });

  it('shows published flows when approved content exists', () => {
    render(
      <AutoGuideProvider
        appId="demo"
        mode="published"
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
            factIds: ['f2'],
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
            status: 'published',
          },
        ]}
        facts={[sampleFacts[1]!]}
      >
        <AutoGuideBar features={{ widget: true }} />
      </AutoGuideProvider>,
    );
    fireEvent.click(screen.getByLabelText('Hilfe öffnen'));
    expect(screen.getByText('Urlaub beantragen')).toBeTruthy();
    expect(screen.getByText(/Exportieren/)).toBeTruthy();
    expect(screen.queryByText(/Doc-Bundle fehlt/)).toBeNull();
  });

  it('shows loading skeleton with aria-busy', () => {
    render(
      <AutoGuideProvider appId="demo" loading>
        <AutoGuideBar features={{ widget: true }} />
      </AutoGuideProvider>,
    );
    fireEvent.click(screen.getByLabelText('Hilfe öffnen'));
    expect(screen.getByRole('dialog').getAttribute('aria-busy')).toBe('true');
  });

  it('shows error state with retry', () => {
    const onRetry = vi.fn();
    render(
      <AutoGuideProvider appId="demo" error="Dokumentation konnte nicht geladen werden." onRetry={onRetry}>
        <AutoGuideBar features={{ widget: true }} />
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
        <AutoGuideBar features={{ widget: true }} />
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
