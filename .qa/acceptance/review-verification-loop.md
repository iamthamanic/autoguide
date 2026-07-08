# Feature: Implement Review Verification Loop

<!-- synced issue #87 -->

## Intent
Developer edits become durable verified or unsupported knowledge.

## Happy Path
- [x] AI proposal cannot overwrite manual review
- [x] Edited fact persisted with review action history
- [x] CLI `review` supports edit flow with verification rerun
- [x] Tests for overwrite prevention and edit persistence

## Implementation Notes
- `review-history.json`, CLI `review --edit --value`
- `packages/core/src/review/verify-fact.ts`, `review-verification.test.ts`
