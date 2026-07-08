# Feature: Validate hr-workflows integration with three complete flows

<!-- seeded by ecc-runner from issue #41 — synced issue #87 -->

## Intent
End-to-end proof: `integrations/hr-workflows` with 3 step-by-step flows documented and publishable (self-contained fixtures, no external repos).

## Happy Path
- [x] 3 flows with ordered steps in flows.json
- [x] Markdown export readable in German
- [x] published mode hides unreviewed facts
- [x] Playwright import from checked-in fixture used

## Edge Cases
- [x] Role-filtered export (Mitarbeiter vs HR-Admin) covered in integration test

## Regression
- [x] `packages/cli/src/hr-workflows.integration.test.ts` green in `pnpm run verify`

## Assumptions
- Fixtures live in `integrations/hr-workflows/fixtures/`

## Implementation Notes
- Self-contained scenario under `integrations/hr-workflows/`
- Integration test: scan → graph → flows (≥3, ordered steps) → German Markdown/HTML export
- Published-mode fact filter and role-based flow export asserted
