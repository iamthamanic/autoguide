# Feature: Implement Review Verification Loop

<!-- seeded by ecc-runner from issue #71 on 2026-07-08 — @implement may refine -->

## Intent
Developer edits become durable verified or unsupported knowledge.

## Happy Path
- [ ] - [ ] AI proposal cannot overwrite manual review
- [ ] - [ ] Edited fact persisted with review action history
- [ ] - [ ] CLI `review` supports edit flow with verification rerun
- [ ] - [ ] Tests for overwrite prevention and edit persistence
- [ ] **Feature slug:** `review-verification-loop`

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
- `packages/core/src/review/types.ts` — review action types and history records
- `packages/core/src/review/verify-fact.ts` — verification rerun after edit
- `packages/core/src/review/review-queue.ts` — history, overrides, verification loop
- CLI `review --edit` with `--value`; persists `review-history.json`
- Unsupported edits append recommendations
