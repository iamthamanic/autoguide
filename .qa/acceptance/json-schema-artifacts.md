# Feature: Committed JSON Schema files for knowledge artifacts

<!-- seeded by ecc-runner from issue #79 on 2026-07-08 — @implement may refine -->

## Intent
PRD acceptance: public JSON validates against schema (formal JSON Schema, not only TS guards).

## Happy Path
- [ ] - [ ] Schema files committed and versioned
- [ ] - [ ] `autoguide validate` uses JSON Schema
- [ ] - [ ] hr-workflows fixture validates
- [ ] **Feature slug:** `json-schema-artifacts`

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
- `packages/core/schemas/*.schema.json` — committed artifact schemas
- `packages/cli/src/lib/json-schema-validator.ts` — Ajv validation (Node/CLI only)
- `autoguide validate` validates confidence.json via JSON Schema
- CI hr-workflows validate workflow exercises schema checks
