# Feature: CLI generate command for tours and documentation bundles

<!-- seeded by ecc-runner from issue #83 on 2026-07-08 — @implement may refine -->

## Intent
Add `autoguide generate` per SPEC (distinct from export format conversion).

## Happy Path
- [ ] - [ ] `autoguide generate tours` writes tours.json from existing flows
- [ ] - [ ] Documented in README and AGENTS.md
- [ ] - [ ] Tests for generate entrypoint
- [ ] **Feature slug:** `cli-generate`

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
- `packages/cli/src/commands/generate.ts` — tours, recommendations, bundle targets
- Writes `tours.json`, refreshes `recommendations.json`, optional `doc-bundle.json`
- README + AGENTS.md document generate usage
