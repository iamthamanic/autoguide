# Feature: Define core types and fact model in @autoguide/core

<!-- synced issue #87 -->

## Intent
Create framework-agnostic core types: Fact, Feature, Page, Flow, Provenance, Confidence, ReviewStatus.

## Happy Path
- [x] packages/core builds standalone
- [x] No React/DOM/Node-specific imports in core
- [x] Fact type includes provenance, confidence, review_status
- [x] Unit tests for type guards/validators

## Regression
- [x] `pnpm run verify` passes

## Implementation Notes
- `packages/core/src/types/fact.ts`, `validators/fact.ts`, `fact.test.ts`
