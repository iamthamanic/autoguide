# Feature: Suggest code improvements (recommendation engine)

<!-- synced issue #87 — see also recommendation-engine-complete.md -->

## Intent
Suggest code improvements: missing labels, ambiguous handlers, missing data-doc.

## Happy Path
- [x] Missing label detection
- [x] recommendations.json written
- [x] CLI doctor surfaces top recommendations

## Implementation Notes
- Superseded detail: `.qa/acceptance/recommendation-engine-complete.md`
- `packages/core/src/recommendations/engine.ts`
