# Feature: PII and secret redaction hooks before AI and export

<!-- seeded by ecc-runner from issue #73 on 2026-07-08 — @implement may refine -->

## Intent
From GitHub issue #73: PII and secret redaction hooks before AI and export

## Happy Path
- [ ] - [ ] No obvious secrets in `.autoguide/*.json`
- [ ] - [ ] No obvious secrets in docs export
- [ ] - [ ] No obvious secrets in AI provider request payload
- [ ] - [ ] Redaction preserves enough semantic context for docs
- [ ] - [ ] Tests cover runtime, review, export, AI and SQLite indexing
- [ ] **Feature slug:** `pii-secret-redaction`

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
- `packages/core/src/redaction/` — central patterns, `redactString`, `redactUnknown`, `configureRedaction`
- Storage JSON writes and SQLite index upserts redact automatically
- Export markdown/html, AI prompts, runtime scanner labels/text redact secrets
- Config: `redaction.extraPatterns` in `autoguide.config.json`
