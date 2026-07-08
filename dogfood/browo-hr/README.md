# browo-hr Dogfood — AutoGuide Integration

End-to-end validation of AutoGuide against the browo-hr HR app.

## Voraussetzungen

- browo-hr Frontend läuft auf `http://localhost:3010`
- Playwright-Report aus `browo-hr/e2e` (JSON) oder mitgeliefertes Fixture

## Scan mit echtem browo-hr

```bash
cd dogfood/browo-hr

# Optional: Quellpfad auf echtes Frontend zeigen
export BROWO_HR_SRC=../../../browo-hr/browo-hr/frontend/src

pnpm exec autoguide scan \
  --source-dir "${BROWO_HR_SRC:-src}" \
  --playwright-report ../../../browo-hr/browo-hr/e2e/playwright-report/results.json

pnpm exec autoguide review list
pnpm exec autoguide export --format md
pnpm exec autoguide publish
```

## Rollen (Issue #38)

Playwright-Suite-Titel werden in Rollen-Tags übersetzt:

| Suite-Muster | Rolle | Beispiel-Flow |
|--------------|-------|---------------|
| `(User)` / Mitarbeiter | `Mitarbeiter` | Wiki-Artikel, Wiki-Suche |
| `Stammdaten` / Admin | `HR-Admin` | Mitarbeiter Stammdaten prüfen |

Export pro Rolle:

```bash
pnpm exec autoguide export --format md --role Mitarbeiter --out docs/mitarbeiter
pnpm exec autoguide export --format pdf --role HR-Admin --out docs/hr-admin
```

Im Widget filtert `userRole` Help Center und Suche:

```tsx
<AutoGuideProvider appId="browo-hr" userRole="Mitarbeiter" mode="published">
```

## Validierte Abläufe (Alternativen zu Urlaub)

1. Wiki-Artikel im Lernzentrum ansehen
2. Wiki durchsuchen
3. Mitarbeiter Stammdaten prüfen

## CI

`packages/cli/src/dogfood-browo-hr.test.ts` nutzt das Fixture-Report und prüft Flows, Markdown-Export, Published-Filter und Rollen-Export.

### Dokumentation validieren (Issue #40)

Nach dem Scan prüft `autoguide validate` Schema, veraltete Facts/Seiten und kritische offene Reviews:

```bash
cd dogfood/browo-hr
pnpm exec autoguide scan --no-ai
pnpm exec autoguide validate
```

Nur Warnungen (z. B. veraltete Docs in Entwicklung):

```bash
pnpm exec autoguide validate --soft
```

GitHub Actions: `.github/workflows/validate-docs.yml` führt Scan + Validate für dieses Dogfood-Projekt aus.
