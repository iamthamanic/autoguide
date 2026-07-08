# AutoGuide Agent Security

Read `AGENTS.md` at repo root before making changes.

## Forbidden

- Never use `--no-verify` or `--dangerously-skip-permissions`
- Never hardcode API keys, tokens, or passwords — use environment variables
- Never push to `main` directly; open a PR from an issue branch
- Never run `sudo` or destructive `rm -rf` without explicit user request
- Never force-push to `main`/`master`

## Stack

- pnpm monorepo (`packages/`, `plugins/`, `examples/`)
- TypeScript strict; keep framework imports out of `@autoguide/core`
- Local knowledge base: `.autoguide/` (gitignored runtime data)

## Verification

```bash
pnpm run verify
npx ecc-agentshield scan --path .cursor
```
