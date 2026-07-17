# Feature: Help after scan shows drafts in development

<!-- auto-generated for help-after-scan-dev-drafts -->

## Intent
Nach Scan in `development` zeigt Help auf einer Route nutzbare Inhalte (Flows/Fakten/Entwürfe) oder kurze DE-Gründe — keine CLI-Wand und keine „Reviews blockieren Hilfe“-Leere.

## Preconditions
- Core help resolver + React widget
- Scan artifacts with pages/facts (flows optional)

## Happy Path
- [ ] `normalizeRoute('dashboard')` equals `normalizeRoute('/dashboard')`
- [ ] Scan links matching facts onto `page.factIds`
- [ ] development Help for a linked route shows draft actions (pending OK)
- [ ] development Help with unlinked route but non-empty bundle shows draft digest (not only CLI)
- [ ] Open reviews do not blank Help in development
- [ ] Empty-state prefers `scan --auto`; no review-blocker copy in development
- [ ] Dev-Scan runs with `--auto` and client reloads with cache-bust
- [ ] `pnpm run verify` green

## Edge Cases
- [ ] published mode still gates to approved + confidence ≥ 0.85
- [ ] Generic handler noise stays filtered from Help actions
- [ ] Completely empty bundle still explains sync/scan briefly

## Regression
- [ ] Existing help/widget tests still pass
- [ ] Handler-noise filter preference for labels retained when page-linked

## Assumptions
- No browo hardcodes; generic route/file heuristics only

## Implementation Notes
- `packages/core/src/help/context-resolver.ts` — slash normalize + route-scoped drafts
- `packages/core/src/help/empty-state.ts` — softer development gaps
- `packages/core/src/help/link-page-facts.ts` — page↔fact linking
- `packages/cli` scan uses linker; vite Dev-Scan `--auto`
- `packages/client` + react AutoGuide cache-bust reload
