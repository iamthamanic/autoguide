# Feature: Playwright flow verification — prove guides against app behavior

<!-- synced issue #87 -->

## Intent
Verify generated flow steps execute successfully in a real browser.

## Happy Path
- [x] A flow verified in `examples/react-vite`
- [x] Failed step stores artifact path in flow metadata
- [x] Verified flows eligible for publish gate
- [x] CLI flag: `autoguide scan --verify-flows`

## Implementation Notes
- `packages/playwright/src/verify-flows.ts`
- Publish gate blocks failed/partial verified flows
- Fixture: `examples/react-vite/fixtures/save-action-flow.json`
