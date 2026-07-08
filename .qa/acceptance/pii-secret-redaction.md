# Feature: PII and secret redaction hooks before AI and export

<!-- synced issue #87 -->

## Intent
PII and secret redaction hooks before AI and export.

## Happy Path
- [x] No obvious secrets in `.autoguide/*.json`
- [x] No obvious secrets in docs export
- [x] No obvious secrets in AI provider request payload
- [x] Redaction preserves enough semantic context for docs
- [x] Tests cover runtime, review, export, AI and SQLite indexing

## Implementation Notes
- `packages/core/src/redaction/` — wired through storage, export, AI, runtime
