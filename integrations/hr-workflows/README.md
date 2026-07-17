# HR Workflows — Integration Scenario

Self-contained HR-style scenario for AutoGuide: routes, role-tagged Playwright fixture, scan → export → validate. Runs entirely inside this repo.

## Seed ordered flows (canonical path)

This fixture is the **in-repo** way to get ≥1 ordered flow into `.autoguide/flows.json` without any external app:

```bash
cd integrations/hr-workflows

# Config already points at fixtures/playwright-report.json via scan.playwrightImportPath
pnpm exec autoguide scan --no-ai

# Or explicit CLI override:
pnpm exec autoguide scan --no-ai --playwright-import fixtures/playwright-report.json

# Expect ≥3 flows with ordered steps in .autoguide/flows.json
pnpm exec autoguide doctor
pnpm exec autoguide validate
pnpm exec autoguide export --format md
```

Fixture Playwright report: `fixtures/playwright-report.json` (configured in `autoguide.config.json` as `scan.playwrightImportPath`).

## Validated flows

1. Wiki-Artikel im Lernzentrum ansehen
2. Wiki durchsuchen
3. Mitarbeiter Stammdaten prüfen

## Roles

Playwright suite titles map to role tags:

| Suite pattern | Role | Example flow |
|---------------|------|--------------|
| `(User)` / Mitarbeiter | `Mitarbeiter` | Wiki article, Wiki search |
| `Stammdaten` / Admin | `HR-Admin` | Employee master data |

Role export:

```bash
pnpm exec autoguide export --format md --role Mitarbeiter --out docs/mitarbeiter
pnpm exec autoguide export --format pdf --role HR-Admin --out docs/hr-admin
```

Widget filter via `userRole`:

```tsx
<AutoGuideProvider appId="hr-workflows" userRole="Mitarbeiter" mode="published">
```

## Tests

`packages/cli/src/hr-workflows.integration.test.ts` copies this directory to a temp folder and verifies flows, Markdown/HTML/PDF export, published filter, and role export.

## Validate

```bash
pnpm exec autoguide validate          # strict — fails on schema/stale/review issues
pnpm exec autoguide validate --soft   # warnings only
```

GitHub Actions: `.github/workflows/validate-docs.yml`

## Optional dogfood follow-up (external browo-hr)

If you have browo-hr cloned locally (e.g. `../browo-hr`), you can point scan at its source and a Playwright JSON report for **manual** realism checks. **Not required** for build, test, or CI — prefer the fixture above for CI.

```bash
cd integrations/hr-workflows

pnpm exec autoguide scan --no-ai \
  --source ../../../browo-hr/browo-hr/frontend/src \
  --playwright-import ../../../browo-hr/browo-hr/e2e/playwright-report/results.json
```

Authenticated apps also need a session for runtime capture — see README (`--storage-state`).
