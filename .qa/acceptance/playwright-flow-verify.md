# Feature: Playwright flow verification — prove guides against app behavior

<!-- seeded by ecc-runner from issue #72 on 2026-07-08 — @implement may refine -->

## Intent
Verify generated flow steps execute successfully in a real browser.

## Happy Path
- [ ] - [ ] A flow verified in `examples/react-vite`
- [ ] - [ ] Failed step stores artifact path in flow metadata
- [ ] - [ ] Verified flows eligible for publish gate
- [ ] - [ ] CLI flag: `autoguide scan --verify-flows` or subcommand
- [ ] **Feature slug:** `playwright-flow-verify`

## Edge Cases
- [ ] (from .qa/edge-cases.md + @implement)

## Regression
- [ ] Feed and topic routes still load

## Assumptions
- none

## Screenshots
| Step | Filename |
|------|----------|
| 1 | `01-happy-path.png` |

## Implementation Notes
- `FlowVerificationProfile` on `FlowRecord` in core
- `packages/playwright/src/verify-flows.ts` — Playwright step runner
- CLI `scan --verify-flows`; publish blocks failed/partial verified flows
- Fixture: `examples/react-vite/fixtures/save-action-flow.json`
