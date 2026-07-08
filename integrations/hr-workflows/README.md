# HR Workflows — Integration Scenario

Self-contained HR-style scenario for AutoGuide: routes, role-tagged Playwright fixture, scan → export → validate. Runs entirely inside this repo.

## Quick start (CI / local, no external deps)

```bash
cd integrations/hr-workflows

pnpm exec autoguide scan --no-ai
pnpm exec autoguide validate
pnpm exec autoguide export --format md
```

Fixture Playwright report: `fixtures/playwright-report.json` (configured in `autoguide.config.json`).

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

## Optional: real browo-hr app

If you have [browo-hr](https://github.com/) cloned locally (e.g. `../browo-hr`), you can point scan at its source and e2e report for manual realism checks. **Not required** for build, test, or CI.

```bash
cd integrations/hr-workflows

export BROWO_HR_SRC=../../../browo-hr/browo-hr/frontend/src

pnpm exec autoguide scan \
  --source-dir "${BROWO_HR_SRC:-src}" \
  --playwright-report ../../../browo-hr/browo-hr/e2e/playwright-report/results.json
```
