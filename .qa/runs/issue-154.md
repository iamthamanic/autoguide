# Issue #154 — auto sufficiency ordered flows

## Pipeline
- implement: done — sufficient only with ordered flows
- verify-ticket: PASS (`pnpm run verify`)
- review-ticket: ACCEPT — minimal core gate change; tests cover browo FP
- ecc-check: READY (AgentShield: pre-existing .claude findings only)
- UI: n/a

## Notes
- Dogfood P0: interactive_coverage alone no longer skips crawl under --auto
