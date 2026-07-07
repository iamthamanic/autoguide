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

## Validierte Abläufe (Alternativen zu Urlaub)

1. Wiki-Artikel im Lernzentrum ansehen
2. Wiki durchsuchen
3. Mitarbeiter Stammdaten prüfen

## CI

`packages/cli/src/dogfood-browo-hr.test.ts` nutzt das Fixture-Report und prüft Flows, Markdown-Export und Published-Filter.
