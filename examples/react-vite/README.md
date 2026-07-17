# AutoGuide React Vite Beispiel

Referenz-App für die **Drop-in-Integration** von AutoGuide.

## Setup

```bash
# Im Monorepo-Root:
pnpm install
pnpm dev    # startet Vite unter http://localhost:5173
```

## Integration

Die App verwendet `<AutoGuide />` als einzige AutoGuide-Komponente:

```tsx
import { AutoGuide, DocElement } from '@iamthamanic/autoguide-react';

<AutoGuide appId="example-react-vite" mode="published" bundleBase="/autoguide">
  <App />
</AutoGuide>
```

Das Vite-Plugin kopiert `.autoguide/*.json` automatisch nach `public/autoguide/`:

```ts
import autoguide from '@iamthamanic/autoguide-vite';
plugins: [react(), autoguide()]
```

## Artefakte

Die `.autoguide/`-Dateien sind committed (kein Scan nötig für das Beispiel).
In einer echten App: `autoguide scan` → Review → `autoguide publish` → `autoguide sync --target public/autoguide`.
**Published-Hilfe wird nicht gefaked** — nur freigegebene Facts erscheinen im `published` Mode.

### Autonomie-Scan (ohne Host-Playwright-Report)

Drop-in: eigener Crawl erzeugt geordnete Flows — **kein** externes JSON-Reporter-Artefakt nötig:

```bash
cd examples/react-vite
# Dev-Server parallel: pnpm dev (http://localhost:5173)
pnpm exec autoguide scan --auto --no-ai --base-url http://localhost:5173
# oder explizit nur Crawl:
pnpm exec autoguide scan --crawl --no-ai --base-url http://localhost:5173
pnpm exec autoguide doctor          # Sufficiency + DE-Hinweise
pnpm exec autoguide generate tours  # optional, wenn flows.json Schritte hat
```

Config-Option: `"scan": { "auto": true }` (sonst explizit `--auto`, um Crawl-Kosten zu vermeiden).

### Optional: Flows aus vorhandenem Playwright-Report

Wenn die Host-App bereits einen Report hat (`fixtures/playwright-report.json` / `scan.playwrightImportPath`):

```bash
cd examples/react-vite
pnpm exec autoguide scan --no-ai
# oder explizit:
pnpm exec autoguide scan --no-ai --playwright-import fixtures/playwright-report.json
# → .autoguide/flows.json mit ≥1 geordnetem Flow
pnpm exec autoguide doctor
```

Kanonischer CI-Pfad mit mehreren Rollen-Flows: `integrations/hr-workflows`.

## Was man sieht

- Hilfe-Button (FAB) unten rechts
- Hilfe-Panel mit Kontext, Suche und Flow-Schritten
- `DocElement` demonstriert `data-doc-id`-Attributierung