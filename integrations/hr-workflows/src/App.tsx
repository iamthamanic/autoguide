import { Route, Routes } from 'react-router-dom';

export function App() {
  return (
    <Routes>
      <Route path="/learning" element={<LearningPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/time-management" element={<TimeManagementPage />} />
    </Routes>
  );
}

function LearningPage() {
  return (
    <main>
      <h1>Lernzentrum</h1>
      <button data-doc-id="wiki.tab" data-doc-title="Wiki Tab">
        Wiki
      </button>
    </main>
  );
}

function LoginPage() {
  return (
    <main>
      <h1>Anmelden</h1>
      <button onClick={handleLogin}>Login</button>
    </main>
  );
}

function DashboardPage() {
  return <main>Dashboard</main>;
}

function TimeManagementPage() {
  return (
    <main>
      <h1>Zeiterfassung</h1>
      <button aria-label="Stammdaten öffnen">Stammdaten</button>
    </main>
  );
}

function handleLogin() {
  /* HR login flow (fixture scenario) */
}
