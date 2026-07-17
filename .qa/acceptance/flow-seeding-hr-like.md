# Feature: Flow seeding path for real HR-like flows into flows.json

## Intent
Mindestens einen geordneten Flow zuverlässig nach flows.json bringen — Playwright-Import + dokumentierter In-Repo-Pfad (hr-workflows).

## Happy Path
- [ ] Documented path via `--playwright-import` / `scan.playwrightImportPath` + hr-workflows fixture
- [ ] Scan warns when flows empty; doctor surfaces same hint
- [ ] hr-workflows README CLI flags corrected; dogfood browo note is optional follow-up
- [ ] Unit test for flowSeedingWarning
- [ ] Existing hr-workflows integration test still proves ≥3 ordered flows
- [ ] `pnpm run verify` passes

## Implementation Notes
- `packages/cli/src/lib/flow-seeding-hint.ts`
- Docs: README + integrations/hr-workflows/README.md
