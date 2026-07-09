# Feature: Implement browser artifact loader package @autoguide/client

<!-- seeded by ecc-runner from issue #110 on 2026-07-09 — @implement may refine -->

## Intent
Add `@autoguide/client` — a browser-safe loader that fetches AutoGuide knowledge artifacts (facts, pages, flows, tours) from a base URL or manifest, matching the CLI `ArtifactBundle` shape.

## Happy Path
- [x] `loadArtifactBundle` returns facts, pages, flows, tours
- [x] Works with `doc-bundle.json` manifest paths
- [x] Unit tests with fetch mock
- [x] `pnpm run verify` passes

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
