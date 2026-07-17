# Feature: Authenticated / session-aware runtime scan

## Intent
Runtime-Scan soll geschützte Routen sehen können — Session via Playwright storageState (Cookies).

## Happy Path
- [ ] `captureRuntimeSnapshots` accepts `storageStatePath` and creates a Playwright context with that state
- [ ] CLI `--storage-state` and config `scan.storageStatePath` wire through
- [ ] Fixture test: protected route only yields documented elements with storageState
- [ ] README documents codegen + config path
- [ ] `pnpm run verify` passes

## Edge Cases
- [ ] Missing storageState path → warning + continue without session
- [ ] No credentials committed

## Implementation Notes
- Playwright `browser.newContext({ storageState })`
- Docs: codegen `--save-storage`
