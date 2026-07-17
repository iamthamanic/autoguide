# Issue #144 — Scan sufficiency gate

## Phase log
- implement: DONE — core sufficiency + scan/doctor wire
- verify: PASS (`pnpm run verify`)
- review: ACCEPT — minimal core module, DE reasons, tests, no browo
- ecc-check: READY (verify + agentshield pre-existing .claude findings)
- PR: pending

## Criteria
sufficient: ≥1 ordered flow OR (≥3 interactive facts AND ≥1 page)
escalate: not sufficient but pages/facts exist
blocked: no pages and no facts
