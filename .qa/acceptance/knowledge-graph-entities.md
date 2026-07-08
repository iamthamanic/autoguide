# Feature: Build real Knowledge Graph entity and relationship model

<!-- synced issue #87 -->

## Intent
Replace fact-only merge with Page→Feature→Element→Flow entity graph.

## Happy Path
- [x] Page contains Features and Elements
- [x] Element can link to Handler facts
- [x] Graph queries by route and role
- [x] Scan pipeline writes graph alongside facts.json
- [x] Unit tests for merge and query

## Implementation Notes
- `packages/core/src/graph/entity-graph.ts` — `graph.json` on scan
- `entity-graph.test.ts`, hr-workflows integration asserts entities/relationships
