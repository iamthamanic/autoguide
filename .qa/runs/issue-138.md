# Issue #138 — Playwright → Flows first-class

**Started:** 2026-07-17
**Branch:** issue/138-playwright-flows-first-class
**Phase:** implement

## Intent
Reliable Playwright import → ≥1 ordered flow in flows.json; document CLI; strengthen hr-workflows/react-vite; DE doctor hint when empty.

## Verify-ticket
- PASS: pnpm run verify green; acceptance Happy Path covered by playwright-import + hr-workflows tests + docs
- No secrets; no browo hardcodes in production diff

## Review-ticket
- ACCEPT: scoped CLI/docs/example; architecture OK (CLI hint + doctor + scan); tests cover edge cases

## ECC-check
- Phase A verify: PASS
- Phase B verify-ticket: PASS
- Phase C review: ACCEPT
- Phase D AgentShield: (see below)
- Phase E UI: N/A (no widget UI change)
