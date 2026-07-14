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
In einer echten App: `autoguide scan` → `autoguide publish` → `autoguide sync --target public/autoguide`.

## Was man sieht

- Hilfe-Button (FAB) unten rechts
- Hilfe-Panel mit Kontext, Suche und Flow-Schritten
- `DocElement` demonstriert `data-doc-id`-Attributierung