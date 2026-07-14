# AutoGuide Integration — Drop-in SDK (React + Vite)

AutoGuide in 5 Minuten in eine bestehende React + Vite App einbinden.

## Voraussetzungen

- Node.js 20+
- pnpm 9+ (oder npm/yarn — pnpm empfohlen für Monorepo-Setup)
- Vite 6+ mit React

## Schritt 1 — Installieren

```bash
npm install @autoguide/react @autoguide/vite @autoguide/cli
```

> **Hinweis:** Die Packages sind aktuell `private` und noch nicht auf npm. Bis zum ersten Release das Repo klonen und als Workspace einbinden:
>
> ```bash
> git clone https://github.com/iamthamanic/autoguide.git ../autoguide
> # In pnpm-workspace.yaml hinzufügen:
> # packages:
> #   - '../autoguide/packages/*'
> #   - '../autoguide/plugins/*'
> ```

## Schritt 2 — Vite Plugin

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import autoguide from '@autoguide/vite';

export default defineConfig({
  plugins: [react(), autoguide()],
});
```

Das Plugin:
- Kopiert `.autoguide/*.json` während dev/build nach `public/autoguide/`
- Stellt `virtual:autoguide` als Modul bereit (Bundle-Base + Manifest)
- Überwacht `.autoguide/` im Dev-Server und aktualisiert live

## Schritt 3 — Initialisieren + Scannen

```bash
npx autoguide init
npx autoguide scan
npx autoguide review          # Facts prüfen (optional)
npx autoguide generate bundle # tours + recommendations + doc-bundle.json
npx autoguide publish         # auf published-Modus schalten
```

Danach liegt `.autoguide/` mit `facts.json`, `pages.json`, `flows.json`, `tours.json`, `doc-bundle.json`.

## Schritt 4 — `<AutoGuide />` einbinden

```tsx
// src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AutoGuide } from '@autoguide/react';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AutoGuide
      appId="meine-app"
      mode="published"
      userRole="Mitarbeiter"
      bundleBase="/autoguide"
    >
      <App />
    </AutoGuide>
  </StrictMode>,
);
```

Das war's — der Hilfe-Button (FAB unten rechts) erscheint automatisch.

### Features optional einschalten

```tsx
<AutoGuide
  appId="meine-app"
  mode="published"
  features={{ widget: true, inspector: true, tours: true }}
>
  <App />
</AutoGuide>
```

| Feature | Default | Beschreibung |
|---------|---------|-------------|
| `widget` | `true` | Hilfe-Button + Panel (FAB) |
| `inspector` | `false` | Dev-Inspector für Element-Facts |
| `tours` | `false` | In-App Guided Tour Runner |

## Schritt 5 — Static Assets syncen (optional)

Für Produktion ohne Vite-Plugin oder für statisches Hosting:

```bash
npx autoguide sync --target public/autoguide --clean
```

Kopiert `facts.json`, `pages.json`, `flows.json`, `tours.json`, `recommendations.json`, `doc-bundle.json` in das Zielverzeichnis.

## Modi

| Modus | Sichtbar |
|------|----------|
| `development` | Alle Facts, auch unsichere (`needs_review`, `ai_proposal`) — nur für Devs |
| `published` | Nur `approved` Facts mit `confidence >= 0.85` — für End-User |

## `DocElement` — Elemente annotieren

```tsx
import { DocElement } from '@autoguide/react';

<DocElement id="action.save" title="Speichern" description="Speichert den aktuellen Datensatz.">
  <button>Speichern</button>
</DocElement>
```

Setzt `data-doc-id` und registriert Metadaten beim Provider für Kontext-Auflösung.

## CLI Übersicht

| Befehl | Zweck |
|--------|-------|
| `autoguide init` | `autoguide.config.json` anlegen |
| `autoguide scan` | Source + Runtime + Playwright scannen → `.autoguide/` |
| `autoguide review` | Review-Queue: Facts akzeptieren/ablehnen |
| `autoguide generate bundle` | Tours + Recommendations + doc-bundle.json |
| `autoguide publish` | Published-Modus aktivieren (Gate: approved + confidence ≥ 0.85) |
| `autoguide sync --target <dir>` | JSONs in statisches Verzeichnis kopieren |
| `autoguide export --format md\|html\|pdf` | Dokumentation exportieren |
| `autoguide validate` | CI-Validierung (Schemas + Stale-Check) |
| `autoguide doctor` | Health-Check + Empfehlungen |

## Referenz-Example

Siehe `examples/react-vite/` für eine komplette Drop-in-Integration mit committed `.autoguide/` Artifacts.

## Fehlerbehebung

| Problem | Lösung |
|---------|--------|
| Hilfe-Button erscheint nicht | `mode` prüfen; `published` ohne approved Facts zeigt leeres Panel |
| `Laden fehlgeschlagen` | `.autoguide/` fehlt oder `bundleBase` stimmt nicht — `autoguide scan` + `sync` ausführen |
| Vite-Plugin warn: kein Artefakt-Ordner | `autoguide scan` im Projekt-Root ausführen |
| Lockfile-Fehler in CI | `pnpm install` lokal ausführen, Lockfile committen |