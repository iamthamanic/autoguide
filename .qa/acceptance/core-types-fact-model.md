# Feature: Define core types and fact model in @autoguide/core

<!-- seeded by ecc-runner from issue #2 on 2026-07-07 — @implement may refine -->

## Intent
Create framework-agnostic core types: Fact, Feature, Page, Flow, Provenance, Confidence, ReviewStatus.

## Happy Path
- [ ] - [ ] packages/core builds standalone
- [ ] - [ ] No React/DOM/Node-specific imports in core
- [ ] - [ ] Fact type includes provenance, confidence, review_status
- [ ] - [ ] Unit tests for type guards/validators

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
<!-- filled after coding -->
