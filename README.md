# AutoGuide

Documentation intelligence engine — make process-heavy software self-explaining.

SDK, CLI, and runtime UI that generate verifiable documentation from code, DOM, and Playwright traces. See [docs/PRD.md](docs/PRD.md) for product scope, [docs/SPEC_FULL.md](docs/SPEC_FULL.md) for the full engineering specification, and [docs/api/README.md](docs/api/README.md) for public package APIs.

## Prerequisites

- Node.js 20+
- pnpm 9+ (or npm/yarn in host apps)
- (Optional) Ollama for local AI enrichment
- (Optional) Playwright for scan import

## AutoGuide in deiner App einbinden

Diese Anleitung beschreibt die **Drop-in-Integration** in eine bestehende **React + Vite** App. Vollständige Referenz: [docs/INTEGRATION.md](docs/INTEGRATION.md) und [examples/react-vite/](examples/react-vite/).

### Überblick

```
Host-App (React)
  └─ <AutoGuide />          ← Runtime: Hilfe-Widget, Inspector, Tours
  └─ Vite-Plugin            ← Kopiert JSON-Artefakte nach public/autoguide/
  └─ autoguide.config.json  ← App-ID, Modus, Output-Pfad

CLI (Dev/CI)
  └─ autoguide scan         ← Source + optional Runtime/Playwright → .autoguide/
  └─ autoguide review       ← Facts manuell freigeben
  └─ autoguide generate     ← tours, recommendations, doc-bundle.json
  └─ autoguide sync         ← Publish-ready JSONs ins Static-Verzeichnis
```

| Phase | Paket | Zweck |
|-------|-------|-------|
| Runtime SDK | `@iamthamanic/autoguide-react` | `<AutoGuide />`, `<DocElement />` |
| Build | `@iamthamanic/autoguide-vite` | Artefakt-Copy + `virtual:autoguide` |
| Loader | `@iamthamanic/autoguide-client` | Browser-seitiges Laden der JSONs (von React genutzt) |
| CLI | `@iamthamanic/autoguide-cli` | `init`, `scan`, `review`, `generate`, `sync`, `export` |

### Schritt 1 — Pakete installieren

```bash
npm install @iamthamanic/autoguide-react @iamthamanic/autoguide-vite
npm install -D @iamthamanic/autoguide-cli
```

> Alternative: Repo als Workspace einbinden — siehe [docs/INTEGRATION.md](docs/INTEGRATION.md#schritt-1--installieren).

Empfohlene `package.json`-Scripts in der Host-App:

```json
{
  "scripts": {
    "autoguide:scan": "autoguide scan",
    "autoguide:bundle": "autoguide generate bundle",
    "autoguide:sync": "autoguide sync --target public/autoguide --clean",
    "autoguide:validate": "autoguide validate"
  }
}
```

### Schritt 2 — Projekt initialisieren

Im Root der Host-App (dort wo `package.json` liegt):

```bash
npx autoguide init
```

Erzeugt `autoguide.config.json`, z. B.:

```json
{
  "appId": "meine-app",
  "mode": "development",
  "outputDir": ".autoguide"
}
```

| Feld | Bedeutung |
|------|-----------|
| `appId` | Eindeutige App-Kennung (muss mit `<AutoGuide appId="…">` übereinstimmen) |
| `mode` | `development` (alles sichtbar) oder `published` (nur freigegebene Facts) |
| `outputDir` | Scan-Output, Standard: `.autoguide/` |

`.autoguide/` in `.gitignore` aufnehmen, **außer** du committest bewusst Publish-Artefakte (wie im Beispiel).

### Schritt 3 — Scannen und Wissensbasis aufbauen

```bash
# Basis-Scan (Source-Code, Config, Struktur)
npx autoguide scan

# Optional: laufende App scannen (Dev-Server muss erreichbar sein)
npx autoguide scan --runtime
npx autoguide scan --runtime-url http://localhost:5173
npx autoguide scan --runtime --storage-state .autoguide/auth.json

# Facts prüfen und freigeben (interaktiv)
npx autoguide review

# Abgeleitete Artefakte erzeugen
npx autoguide generate bundle

# Auf Published-Modus schalten (Gate: approved + confidence ≥ 0.85)
npx autoguide publish
```

Nach dem Scan liegt unter `.autoguide/` u. a.:

| Datei | Inhalt |
|-------|--------|
| `facts.json` | Verifizierte UI-/Flow-Facts mit Provenance |
| `pages.json` | Routen und Seitenkontext |
| `flows.json` | Nutzer-Flows aus Scan/Playwright |
| `tours.json` | Generierte Guided Tours |
| `recommendations.json` | Priorisierte Verbesserungsvorschläge |
| `doc-bundle.json` | Manifest für Runtime-Loader |

#### Flows aus Playwright seeden

Ohne Playwright-Import bleibt `flows.json` oft leer. Kanonischer In-Repo-Pfad:

```bash
cd integrations/hr-workflows
pnpm exec autoguide scan --no-ai --playwright-import fixtures/playwright-report.json
# → .autoguide/flows.json mit ≥1 geordnetem Flow (Fixture liefert drei)
```

Oder in jeder Host-App:

```bash
npx autoguide scan --playwright-import path/to/playwright-report.json
# bzw. autoguide.config.json → scan.playwrightImportPath
```

Details: [integrations/hr-workflows/README.md](integrations/hr-workflows/README.md), Beispiel: [examples/react-vite](examples/react-vite). Externe browo-hr-E2E sind optional (Dogfood), kein CI-Dependency.

### Schritt 4 — Vite-Plugin einbinden

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import autoguide from '@iamthamanic/autoguide-vite';

export default defineConfig({
  plugins: [react(), autoguide()],
});
```

Das Plugin:

- kopiert `.autoguide/*.json` im Dev/Build nach `public/autoguide/`
- stellt `virtual:autoguide` bereit (Bundle-Base + Manifest)
- beobachtet `.autoguide/` im Dev-Server und aktualisiert live

### Schritt 5 — `<AutoGuide />` in die App

```tsx
// src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AutoGuide } from '@iamthamanic/autoguide-react';
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

Danach erscheint der **Hilfe-Button** (FAB unten rechts). `appId` und `bundleBase` müssen zu Config bzw. Static-Pfad passen.

#### Features optional aktivieren

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
|---------|---------|--------------|
| `widget` | `true` | Hilfe-Button + Kontext-Panel |
| `inspector` | `false` | Dev-Inspector für Element-Facts |
| `tours` | `false` | In-App Guided Tour Runner |

#### Dock über Bottom-Navigation

Wenn die Host-App eine feste Bottom-Nav hat, Dock mit `dockBottomOffset` (px) anheben:

```tsx
<AutoGuide
  appId="meine-app"
  mode="published"
  dockBottomOffset={64}
>
  <App />
</AutoGuide>
```

Gleiches Prop gibt es auf `AutoGuideProvider`. Default ist `0` (unverändertes Layout).

Nutzer können das Dock am Label **AutoGuide** verschieben (Maus/Touch/Pfeiltasten). Die Position wird pro `appId` in `localStorage` gespeichert. **Doppelklick** auf das Label stellt die Standardposition (inkl. `dockBottomOffset`) wieder her.

#### Modi

| Modus | Wer sieht was |
|-------|----------------|
| `development` | Alle Facts inkl. `needs_review` und `ai_proposal` — nur für Entwickler |
| `published` | Nur `approved` Facts mit `confidence >= 0.85` — für End-User |

### Schritt 6 — UI-Elemente annotieren (`DocElement`)

```tsx
import { DocElement } from '@iamthamanic/autoguide-react';

<DocElement
  id="action.save"
  title="Speichern"
  description="Speichert den aktuellen Datensatz."
>
  <button type="button">Speichern</button>
</DocElement>
```

Setzt `data-doc-id` und registriert Metadaten für Kontext-Auflösung im Hilfe-Widget.

### Schritt 7 — Produktion / Static Hosting

Ohne Vite-Dev-Server oder für CI-Deploy:

```bash
npx autoguide sync --target public/autoguide --clean
```

Kopiert publish-ready JSONs ins Static-Verzeichnis (`facts`/`pages`/`flows`/`tours`/`recommendations`/`reviews`/`review-history`/`doc-bundle`). `bundleBase="/autoguide"` in `<AutoGuide />` muss dem URL-Pfad entsprechen.

**Typischer CI-Ablauf:**

```bash
pnpm run build          # Host-App
npx autoguide scan
npx autoguide generate bundle
npx autoguide validate  # Schema + Stale-Check — ideal als CI-Step
npx autoguide sync --target dist/autoguide --clean
```

### CLI-Kurzreferenz

| Befehl | Zweck |
|--------|-------|
| `autoguide init` | `autoguide.config.json` anlegen |
| `autoguide scan` | Source + optional Runtime/Playwright → `.autoguide/` |
| `autoguide review` | Review-Queue: Facts akzeptieren/ablehnen |
| `autoguide generate bundle` | Tours + Recommendations + `doc-bundle.json` |
| `autoguide publish` | Published-Modus aktivieren |
| `autoguide sync --target <dir>` | JSONs ins Static-Verzeichnis kopieren |
| `autoguide export --format md\|html\|pdf` | Dokumentation exportieren |
| `autoguide validate` | CI-Validierung (Schemas + Stale-Check) |
| `autoguide doctor` | Health-Check + priorisierte Empfehlungen |

### Fehlerbehebung

| Problem | Lösung |
|---------|--------|
| Hilfe-Button fehlt | `mode="published"` ohne approved Facts → `autoguide review` + `publish` |
| `Laden fehlgeschlagen` | `.autoguide/` fehlt oder `bundleBase` falsch → `scan` + `sync` |
| Vite-Warnung: kein Artefakt-Ordner | `autoguide scan` im Projekt-Root ausführen |
| Leeres Hilfe-Panel | `userRole` prüfen — Rollenfilter kann Facts ausblenden |
| Runtime-Scan schlägt fehl | App unter `baseUrl` erreichbar? `--runtime-url` setzen |
| Runtime sieht nur `/login` | Session speichern und `--storage-state` / `scan.storageStatePath` setzen (siehe unten) |

#### Authentifizierter Runtime-Scan

Geschützte Routen brauchen eine Playwright-Session (Cookies / localStorage):

1. Einmalig einloggen und State speichern:
   ```bash
   npx playwright codegen http://localhost:5173 --save-storage=.autoguide/auth.json
   ```
2. Scan mit Session:
   ```bash
   npx autoguide scan --runtime --storage-state .autoguide/auth.json
   ```
   Oder in `autoguide.config.json`:
   ```json
   { "scan": { "runtime": true, "storageStatePath": ".autoguide/auth.json" } }
   ```

Keine Credentials in Git committen — `auth.json` lokal halten / gitignoren.

### Weitere Ressourcen

- [docs/INTEGRATION.md](docs/INTEGRATION.md) — gleiche Anleitung, kompakt
- [docs/AGENT_INTEGRATION.md](docs/AGENT_INTEGRATION.md) — **Playbook für KI-Coding-Agenten** (Cursor, Claude Code, …)
- [examples/react-vite/](examples/react-vite/) — lauffähige Referenz-App (`pnpm dev`)
- [docs/RELEASE.md](docs/RELEASE.md) — npm-Publish der SDK-Pakete
- [docs/api/README.md](docs/api/README.md) — öffentliche Package-APIs

## Anleitung für KI-Coding-Agenten (Cursor, Claude Code, …)

Wenn ein Agent AutoGuide in eine **fremde Host-App** einbauen soll — nicht in dieses Repo entwickeln.

**Vollständiges Playbook:** [docs/AGENT_INTEGRATION.md](docs/AGENT_INTEGRATION.md)

### Auftrag in einem Satz

Minimaler Drop-in: Dependencies installieren → `autoguide.config.json` → Vite-Plugin → `<AutoGuide>` um `<App />` → `scan` + `generate bundle` → Hilfe-FAB prüfen.

### Checkliste für den Agenten

| # | Aufgabe | Datei / Befehl |
|---|---------|----------------|
| 1 | Packages installieren | `@iamthamanic/autoguide-react`, `-vite`, CLI als devDep |
| 2 | Config anlegen | `autoguide.config.json` — `appId` festlegen |
| 3 | Vite-Plugin | `vite.config.ts` → `autoguide()` |
| 4 | Root-Wrapper | `main.tsx` → `<AutoGuide appId="…" bundleBase="/autoguide">` |
| 5 | Scripts | `package.json`: `autoguide:scan`, `:bundle`, `:sync`, `:validate` |
| 6 | Artefakte | `npx autoguide scan && npx autoguide generate bundle` |
| 7 | Verifikation | Dev-Server → FAB sichtbar; `/autoguide/doc-bundle.json` → 200 |

Referenz-Code: [examples/react-vite/](examples/react-vite/)

### Grenzen — unbedingt beachten

| ✅ Tun | ❌ Nicht tun |
|--------|-------------|
| Minimaler Diff (Config, Vite, Main, optional `DocElement`) | Host-Business-Logik refactoren |
| `@iamthamanic/autoguide-react` importieren | `@autoguide/*` oder `@iamthamanic/autoguide-core` in Host-App |
| `appId` überall identisch (Config + Props) | `<AutoGuide>` *innerhalb* von `<App />` |
| Erst `mode="development"` testen | `published` ohne Scan/Review — leeres Panel |
| UI-Texte auf **Deutsch** | Englische Fehler/Labels im Widget |
| `bundleBase="/autoguide"` (URL-Pfad) | `bundleBase="/public/autoguide"` |
| Secrets nur via Env (`AUTOGuide_AI_*`) | API-Keys in Config oder `.autoguide/` committen |

### Typische Agent-Fehler

1. **Vite-Plugin vergessen** → JSONs landen nicht in `public/autoguide/` → „Laden fehlgeschlagen“
2. **`appId` mismatch** → Widget lädt falsches/leeres Bundle
3. **Runtime-Scan ohne laufenden Dev-Server** → leere DOM-Facts; `--runtime-url` setzen
4. **Zu viele Pakete** — `autoguide-client` nicht direkt installieren (transitive Dep)
5. **Next.js/Webpack** — Vite-Plugin blind kopieren; Stack mit User klären

### Prompt-Vorlage (für User)

```markdown
Integriere AutoGuide Drop-in in diese React+Vite App.
Lies docs/AGENT_INTEGRATION.md (autoguide-Repo) oder README § KI-Agenten.
Packages: @iamthamanic/autoguide-react, @iamthamanic/autoguide-vite, CLI devDep.
appId: "<APP-ID>", mode: development, bundleBase: "/autoguide".
Minimaler Diff. UI Deutsch. Keine Business-Logik ändern.
Danach: autoguide scan && autoguide generate bundle && build prüfen.
Referenz: examples/react-vite/
```

### Agent entwickelt **dieses** AutoGuide-Repo?

Dann gilt [AGENTS.md](AGENTS.md) — Core-Grenzen, `pnpm run verify`, Issue-Branches. Host-Integration oben ist ein anderer Kontext.

## Setup

```bash
# From repository root
pnpm install
cp .env.example .env   # if present — fill values locally, never commit secrets
```

## Development

```bash
pnpm dev    # starts example React Vite app when available
pnpm build
pnpm typecheck
pnpm test
```

Open [http://localhost:5173](http://localhost:5173) (example app). Integration scenarios under `integrations/` run without external app repos.

## Checks (quality gate)

```bash
pnpm run verify    # deterministic: typecheck + test
```

## CLI (local)

After `autoguide init` and `autoguide scan` in a host project:

```bash
npx autoguide scan --runtime          # optional: capture live DOM at baseUrl (needs running app + Playwright)
npx autoguide scan --runtime-url http://localhost:3000  # override URL for runtime capture only
npx autoguide scan --runtime --storage-state .autoguide/auth.json  # authenticated session
npx autoguide generate tours            # tours.json from flows (no re-scan)
npx autoguide generate recommendations  # refresh recommendations.json from facts
npx autoguide generate bundle           # tours + recommendations + doc-bundle.json (with runtime artifact list)
npx autoguide sync --target public/autoguide  # copy publish-ready JSON to static target
npx autoguide export --format md
npx autoguide validate
npx autoguide doctor                  # prioritized recommendations + review hints
```

Third-party scanner plugins: add a module path to `plugins` in `autoguide.config.json` (see `examples/stub-plugin/`).

Before commit/PR, run **`@ecc-check`** (review-ticket + AgentShield + optional verify-ui). No shimwrappercheck in this repo.

## Tests

```bash
pnpm test              # unit tests (Vitest)
pnpm run test:e2e      # Playwright — bootstrap via @verify-ui skill
```

## Project structure

```
autoguide/
├── packages/           # @iamthamanic/autoguide-core, config, storage, ui, cli
├── plugins/            # @iamthamanic/autoguide-react (+ future adapters)
├── examples/           # minimal reference apps (pnpm dev)
├── integrations/       # self-contained scan scenarios (CI fixtures)
├── docs/
│   ├── PRD.md
│   ├── SPEC_FULL.md
│   ├── UI_STYLEGUIDE.md
│   └── api/            # public package API reference
├── .qa/                # design, intake, acceptance, runner config
└── AGENTS.md
```

## Environment variables

Document variables in `.env.example`. Do not commit real secrets.

| Variable | Purpose |
|----------|---------|
| `AUTOGuide_AI_API_KEY` | Optional cloud AI provider key (user-supplied) |
| `AUTOGuide_AI_ENDPOINT` | Optional cloud AI endpoint URL |

## Agent workflow

For AI-assisted development:

1. `@project-setup` — bootstrap (done)
2. `@feature-intake` — epic design + issue slices
3. `@ecc-runner` — autonomous issue pipeline
4. `@implement` — code + acceptance artifact
5. `@ecc-check` — quality gate before ship
6. `@verify-ui` — browser verification

See [AGENTS.md](AGENTS.md).

## Recent changes

- **2026-07-17** — Release v0.1.6: Autonomy (`scan --auto`, sufficiency gate, interactive crawl), draggable dock with persisted position (`@iamthamanic/autoguide-*`)
- **2026-07-17** — Release v0.1.5: Playwright→flows first-class, Help empty-state `explainHelpGap` (DE), sync/doc-bundle includes `reviews.json` (`@iamthamanic/autoguide-*`)
- **2026-07-17** — Release v0.1.4: Inspect overlay hit-testing, `dockBottomOffset`, `--storage-state` / `scan.storageStatePath`, review-queue handler filter, flow-seeding docs (`@iamthamanic/autoguide-*`)
- **2026-07-17** — Release v0.1.3: CLI schema path fix for npm installs (`@iamthamanic/autoguide-*`)
- **2026-07-16** — Release v0.1.2: Dev-Scan im Dock-Menü, SPA-Route-Hook, Vite-Scan-Middleware (`@iamthamanic/autoguide-*`)
- **2026-07-15** — Dock unten mittig (Hilfe, Tour); Dev-Tools Inspect + Review im ⚙-Menü (`chore/npm-scope-iamthamanic`)
- **2026-07-15** — README + docs/AGENT_INTEGRATION.md: KI-Agent Playbook für Host-App-Integration
- **2026-07-15** — README: detailed German integration guide for host apps (`chore/npm-scope-iamthamanic`)
- **2026-07-15** — npm packages renamed to `@iamthamanic/autoguide-*` scope; publish script added (`chore/npm-scope-iamthamanic`)

## License

MIT (TBD)
