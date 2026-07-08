# Feature: Committed JSON Schema files for knowledge artifacts

<!-- synced issue #87 -->

## Intent
PRD acceptance: public JSON validates against schema (formal JSON Schema, not only TS guards).

## Happy Path
- [x] Schema files committed and versioned
- [x] `autoguide validate` uses JSON Schema
- [x] hr-workflows fixture validates

## Implementation Notes
- `packages/core/schemas/*.schema.json`
- `packages/cli/src/lib/json-schema-validator.ts` — Ajv (CLI only)
- CI: `.github/workflows/validate-docs.yml`
