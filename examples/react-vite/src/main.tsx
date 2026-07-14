import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AutoGuide, DocElement } from '@iamthamanic/autoguide-react';

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
    <AutoGuide
      appId="example-react-vite"
      mode="published"
      userRole="Admin"
      bundleBase="/autoguide"
    >
      <App />
    </AutoGuide>
  </StrictMode>,
);