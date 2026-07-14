# AutoGuide — Anleitung für KI-Coding-Agenten

Playbook für **Cursor**, **Claude Code**, **Codex**, **Windsurf** und vergleichbare Agenten, die AutoGuide in eine **Host-App** (nicht dieses Repo) integrieren sollen.

**Ziel:** Drop-in-Integration in React + Vite ohne Business-Logik der Host-App zu verändern.

Referenz-Implementierung: [examples/react-vite/](../examples/react-vite/)  
Menschliche Kurzanleitung: [INTEGRATION.md](INTEGRATION.md)

---

## 1. Bevor du Code schreibst

### Kontext klären

| Frage | Warum |
|-------|-------|
| Welches Framework? | Nur `@iamthamanic/autoguide-react` ist drop-in-ready. Vue/Svelte/Angular: Adapter existieren, aber React+Vite ist der Referenzpfad. |
| Vite oder Webpack/Next? | Vite-Plugin `@iamthamanic/autoguide-vite` ist der unterstützte Build-Pfad. Next.js: Plugin nicht blind einbinden — User fragen. |
| `appId` festlegen | Muss in `autoguide.config.json` und `<AutoGuide appId="…">` identisch sein. |
| Dev vs. Published? | `development` während Integration testen; `published` für End-User (nur approved Facts). |

### Dateien lesen (Host-App)

1. `package.json` — Package Manager, Scripts, bestehende Vite/React-Version
2. `vite.config.ts` — Plugin-Array, `base`-Pfad
3. `src/main.tsx` (oder `main.jsx`) — Root-Render-Einstieg
4. `.gitignore` — ob `.autoguide/` ignoriert wird

### Dateien lesen (AutoGuide)

1. [examples/react-vite/vite.config.ts](../examples/react-vite/vite.config.ts)
2. [examples/react-vite/src/main.tsx](../examples/react-vite/src/main.tsx)
3. [examples/react-vite/autoguide.config.json](../examples/react-vite/autoguide.config.json)

---

## 2. Checkliste — was der Agent tun muss

Reihenfolge einhalten. Nicht überspringen.

```
[ ] 1. Dependencies installieren
[ ] 2. autoguide.config.json anlegen (init oder manuell)
[ ] 3. vite.config.ts — Plugin hinzufügen
[ ] 4. main.tsx — <AutoGuide> als äußerster Wrapper um <App />
[ ] 5. package.json Scripts für scan/sync/validate
[ ] 6. .gitignore — .autoguide/ (Policy mit User klären)
[ ] 7. autoguide scan (+ optional --runtime)
[ ] 8. autoguide generate bundle
[ ] 9. Dev-Server starten — Hilfe-FAB sichtbar?
[ ] 10. DocElement an 1–2 wichtigen Buttons (optional, empfohlen)
```

### Schritt 1 — Dependencies

```bash
npm install @iamthamanic/autoguide-react @iamthamanic/autoguide-vite
npm install -D @iamthamanic/autoguide-cli
```

**Nicht** `@iamthamanic/autoguide-client` direkt installieren — wird von `autoguide-react` mitgezogen.

**Nicht** `@autoguide/*` verwenden — alter Scope, existiert nicht auf npm.

### Schritt 2 — Config

```json
{
  "appId": "<host-app-id>",
  "mode": "development",
  "outputDir": ".autoguide"
}
```

`appId` stabil wählen (kebab-case, kein Leerzeichen).

### Schritt 3 — Vite

```ts
import autoguide from '@iamthamanic/autoguide-vite';

export default defineConfig({
  plugins: [/* bestehende Plugins */, autoguide()],
});
```

Bestehende Plugins **nicht** entfernen. Reihenfolge: React-Plugin vor/nach autoguide ist ok.

### Schritt 4 — React Root

```tsx
import { AutoGuide } from '@iamthamanic/autoguide-react';

<AutoGuide
  appId="<host-app-id>"
  mode="development"
  bundleBase="/autoguide"
>
  <App />
</AutoGuide>
```

- `<AutoGuide>` muss **über** der gesamten App liegen (Router inklusive, wenn vorhanden).
- `bundleBase` muss zum Static-Pfad passen (`public/autoguide` → `/autoguide`).
- Bei `base: '/subpath/'` in Vite: `bundleBase` anpassen.

### Schritt 5 — Scripts

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

### Schritt 6–8 — Artefakte erzeugen

```bash
npx autoguide init          # falls noch nicht vorhanden
npx autoguide scan
npx autoguide generate bundle
```

Runtime-Scan nur wenn Dev-Server läuft:

```bash
npx autoguide scan --runtime-url http://localhost:5173
```

---

## 3. Worauf du achten musst

### Grenzen (kritisch)

| Regel | Begründung |
|-------|------------|
| **Keine Host-Business-Logik ändern** | AutoGuide ist Documentation Layer — keine Feature-Refactors „nebenbei“. |
| **Kein `@iamthamanic/autoguide-core` in Host-App importieren** | Core ist intern; Host nutzt `autoguide-react` + CLI. |
| **Keine Secrets in `.autoguide/` oder Config** | API-Keys nur über Env (`AUTOGuide_AI_*`), nie committen. |
| **`ai_proposal` nicht als Wahrheit behandeln** | Facts erst nach `autoguide review` / manueller Freigabe published. |
| **UI-Texte auf Deutsch** | Fehler, Labels, Help-Panel — Deutsch (Projektregel). |
| **Kein Supabase/Cloud-Backend für AutoGuide** | Lokal: JSON in `.autoguide/`, Static-Serve via Vite/sync. |

### Häufige Agent-Fehler

| Fehler | Korrekt |
|--------|---------|
| `@autoguide/react` importieren | `@iamthamanic/autoguide-react` |
| `<AutoGuide>` innerhalb von `<App />` | `<AutoGuide>` **um** `<App />` |
| `appId` in Config ≠ Props | Ein Wert überall |
| `mode="published"` ohne Scan/Review | Erst `development` testen, dann publish-Flow |
| Vite-Plugin vergessen | Keine JSONs in `public/autoguide/` → Ladefehler |
| `bundleBase="/public/autoguide"` | Falsch — URL-Pfad: `/autoguide` |
| Playwright in Host-`dependencies` | Nur CLI devDependency; Playwright optional für Scan |
| Gesamtes Repo refactoren | Minimaler Diff: Config + vite + main + optional DocElement |

### DocElement — wann und wie

Für interaktive Elemente ohne klaren Scan-Kontext:

```tsx
<DocElement id="feature.export" title="Export" description="Exportiert die aktuelle Ansicht.">
  <button type="button">Export</button>
</DocElement>
```

- `id`: stabil, namespaced (`bereich.aktion`)
- `title` / `description`: Deutsch, sachlich
- Kind-Element bleibt unverändert (nur Wrapper)

### Git / CI

- `.autoguide/` default in `.gitignore` — Scan-Artefakte sind generiert
- Alternative: nur `public/autoguide/*.json` committen für Static-Deploy ohne CLI in CI
- CI-Step empfohlen: `autoguide validate` nach Scan

---

## 4. Verifikation nach Integration

Agent soll explizit prüfen:

1. **Build:** `npm run build` ohne Fehler
2. **Dev:** App startet, kein Console-Error zu `virtual:autoguide`
3. **UI:** Hilfe-FAB unten rechts sichtbar (mode `development`)
4. **Netzwerk:** Requests auf `/autoguide/doc-bundle.json` (oder Manifest) → 200
5. **Validate:** `npx autoguide validate` exit 0

Bei `published` mode zusätzlich:

- `npx autoguide review` — Facts freigeben
- `npx autoguide publish`
- Panel zeigt Inhalte (nicht leer)

---

## 5. Prompt-Vorlage für den User

User kann diesen Block an einen Agent kopieren:

```markdown
Integriere AutoGuide in diese React+Vite App (Drop-in).

Pflicht:
- Lies docs/AGENT_INTEGRATION.md im autoguide-Repo (oder README § KI-Agenten)
- Packages: @iamthamanic/autoguide-react, @iamthamanic/autoguide-vite, CLI als devDep
- Minimaler Diff: vite.config.ts, main.tsx, autoguide.config.json, package.json scripts
- appId: "<DEINE-APP-ID>"
- mode: development zum Testen
- bundleBase: "/autoguide"
- Danach: autoguide scan && autoguide generate bundle
- UI-Texte Deutsch; keine Business-Logik ändern
- Verifikation: build + dev server + Hilfe-FAB sichtbar

Referenz: examples/react-vite/ im autoguide-Repo
```

---

## 6. Wenn du **in diesem Repo** (autoguide) entwickelst

Das ist **nicht** Host-Integration — lies [AGENTS.md](../AGENTS.md):

- `@iamthamanic/autoguide-core` bleibt framework-agnostisch
- React nur in `plugins/react`
- Quality gate: `pnpm run verify`
- Issue branches, nicht direkt auf `main`

---

## 7. Schnellreferenz Pakete

| Install in Host-App | Zweck |
|---------------------|-------|
| `@iamthamanic/autoguide-react` | Runtime UI |
| `@iamthamanic/autoguide-vite` | Build-Plugin |
| `@iamthamanic/autoguide-cli` (dev) | Scan, sync, validate |
| `@iamthamanic/autoguide-client` | ❌ nicht direkt — transitive Dep |
