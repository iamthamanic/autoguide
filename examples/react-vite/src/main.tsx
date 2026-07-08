import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  AutoGuideProvider,
  AutoGuideWidget,
  DocElement,
  InspectorOverlay,
  TourRunner,
} from '@autoguide/react';

const saveTour = {
  id: 'tour-save-action',
  title: 'Aktion speichern',
  roleIds: [],
  status: 'published' as const,
  steps: [
    {
      id: 'step-1',
      title: 'Willkommen',
      body: 'Diese Tour zeigt, wie Sie eine Aktion speichern.',
      targetSelector: 'h1',
      action: 'observe' as const,
    },
    {
      id: 'step-2',
      title: 'Speichern',
      body: 'Klicken Sie hier, um die Aktion zu speichern.',
      targetSelector: '[data-doc-id="action.save"]',
      action: 'click' as const,
    },
  ],
};

function App() {
  const [page, setPage] = useState<'home' | 'settings'>('home');

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: 24 }}>
      <h1>AutoGuide Beispiel-App</h1>
      <nav style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button type="button" onClick={() => setPage('home')}>
          Start
        </button>
        <button type="button" onClick={() => setPage('settings')}>
          Einstellungen
        </button>
      </nav>
      {page === 'home' ? (
        <section>
          <p>Willkommen in der Referenz-App für AutoGuide.</p>
          <DocElement
            id="action.save"
            title="Aktion speichern"
            description="Speichert die aktuelle Aktion in der Referenz-App."
          >
            <button type="button">Aktion speichern</button>
          </DocElement>
        </section>
      ) : (
        <section>
          <p>Einstellungen — zweite Route für Kontext-Tests.</p>
        </section>
      )}
    </main>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AutoGuideProvider appId="example-react-vite" userRole="Admin" mode="published" tours={[saveTour]}>
      <App />
      <AutoGuideWidget />
      <InspectorOverlay />
      <TourRunner tourId="tour-save-action" />
    </AutoGuideProvider>
  </StrictMode>,
);
