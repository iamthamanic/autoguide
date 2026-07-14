# Feature: Extend doc-bundle manifest and add autoguide sync command

## Intent
Extend `autoguide generate bundle` / `doc-bundle.json` to list all runtime artifacts and add `autoguide sync` to copy publish-ready JSON to a host `public/` folder.

## Happy Path
- [x] `doc-bundle.json` includes `runtimeArtifacts` list
- [x] `autoguide sync --target <dir>` copies JSON to target
- [x] `--clean` flag removes stale files
- [x] Target dir created recursively if missing
- [x] CLI tests pass

## Edge Cases
- [x] Target dir missing → created recursively
- [x] Stale files in target → `--clean` removes them
- [x] `.autoguide/` missing → graceful error

## Regression
- [x] `pnpm run verify` passes

## Implementation Notes
- `packages/cli/src/commands/sync.ts` — `runSync()` + `runSyncCommand()`
- `packages/cli/src/commands/generate.ts` — manifest includes `runtimeArtifacts`
- `packages/cli/src/index.ts` — `sync` command registered
- `packages/cli/src/sync.test.ts` — 4 tests