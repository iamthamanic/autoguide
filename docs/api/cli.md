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
| `scan` | `--source`, `--playwright-import`, `--crawl`, `--verify-flows`, `--no-ai` |
| `export` | `--format md|html|pdf`, `--out`, `--role` |
| `validate` | `--soft`, `--json`, `--max-stale` |
| `review` | `--list`, `--accept`, `--reject`, `--edit`, `--value`, `--json` |

## Programmatic API

Command runners live in `packages/cli/src/commands/` (e.g. `runScan`, `runDoctor`) for integration tests.
