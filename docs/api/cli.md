# @iamthamanic/autoguide-cli

Command-line interface for init, scan, review, export, validate, and publish.
Binary: `autoguide` (see `packages/cli/src/index.ts`).

## Commands

| Command | Description |
|---------|-------------|
| `init` | Create autoguide.config.json and .autoguide/ |
| `doctor` | Health check: plugins, recommendations, review queue |
| `scan` | Scan source + optional Playwright import; write artifacts |
| `review` | List, accept, reject, or edit facts in the review queue |
| `generate` | Derive tours, recommendations, or doc bundle (no re-scan) |
| `export` | Export knowledge markdown/html/pdf |
| `validate` | Validate artifacts for CI (JSON Schema, stale facts) |
| `publish` | Validate and switch to published visibility mode |

## Common flags

| Command | Flags |
|---------|-------|
| `scan` | `--source`, `--playwright-import`, `--crawl`, `--auto`, `--verify-flows`, `--no-ai` |
| `export` | `--format md|html|pdf`, `--out`, `--role` |
| `validate` | `--soft`, `--json`, `--max-stale` |
| `review` | `--list`, `--accept`, `--reject`, `--edit`, `--value`, `--json` |

### Scan crawl (autonomy fallback)

`--crawl` runs AutoGuide’s **own** Playwright crawl for uncovered routes. It is the autonomy fallback when a host app does **not** provide a Playwright JSON reporter import — import is optional bonus, not required.

The crawl performs safe interactions (links/buttons) beyond a single `goto`, respecting `scan.safeMode` (destructive labels like delete/löschen are skipped). Results land in flows via the same Playwright evidence merge path.

Subsequent scans **merge** ordered flows into existing `.autoguide/flows.json` (by title) instead of wiping them when the current pass produces no crawl/import flows. To intentionally clear flows, delete `.autoguide/flows.json` (or the whole output dir) before scanning.

### Scan `--auto` (orchestrator)

`autoguide scan --auto` (or `scan.auto: true` in config) runs: source → optional playwright import if configured/present → sufficiency gate → on `escalate`/`blocked`: own crawl (runtime only if already enabled) → re-evaluate. Prefer the explicit flag to avoid surprising crawl cost. Host JSON reporter is never required.

## Programmatic API

Command runners live in `packages/cli/src/commands/` (e.g. `runScan`, `runDoctor`) for integration tests.
