# Acceptance: public-api-docs

Issue: #84

## Criteria
- [x] docs/api/README.md index exists
- [x] Core public exports documented
- [x] CI does not break

## Implementation Notes
- `docs/api/{README,core,cli,react}.md` — curated + generated export tables
- `scripts/generate-api-docs.mjs` — `pnpm run docs:api`
- `tests/api-docs.test.ts` — docs presence and key symbols
