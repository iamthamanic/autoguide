# Feature: Build real Knowledge Graph entity and relationship model

<!-- seeded by ecc-runner from issue #69 on 2026-07-08 — @implement may refine -->

## Intent
Replace fact-only merge with Page→Feature→Element→Flow entity graph.

## Happy Path
- [ ] - [ ] Page contains Features and Elements
- [ ] - [ ] Element can link to Handler facts
- [ ] - [ ] Graph queries by route and role
- [ ] - [ ] Scan pipeline writes graph alongside facts.json
- [ ] - [ ] Unit tests for merge and query
- [ ] **Feature slug:** `knowledge-graph-entities`

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
- `packages/core/src/graph/entity-graph.ts` — EntityGraph, buildEntityGraph, linkRecordsToGraph
- `packages/core/src/graph/entity-graph.test.ts` — contains/triggers/belongsToRole queries
- Scan writes `graph.json`; storage paths updated
- Relationship types: contains, uses, triggers, belongsToRole
