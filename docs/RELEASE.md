# Release Checklist — AutoGuide npm packages

## Publishable packages

| Package | Path | npm name |
|---------|------|----------|
| CLI | `packages/cli` | `@autoguide/cli` |
| Client | `packages/client` | `@autoguide/client` |
| React adapter | `plugins/react` | `@autoguide/react` |
| Vite plugin | `plugins/vite` | `@autoguide/vite` |

All other packages (`@autoguide/core`, `@autoguide/config`, `@autoguide/storage`, etc.) are internal dependencies and stay `private: true` — they are bundled into the CLI and SDK packages at publish time.

## Prerequisites

- [ ] `pnpm run verify` passes on `main`
- [ ] All issues for the release are `agent-done`
- [ ] No uncommitted changes on `main`
- [ ] npm account has access to `@autoguide` scope
- [ ] `npm whoami` confirms login

## Release steps

### 1. Bump versions

```bash
# Choose version: patch / minor / major
pnpm -r --filter '@autoguide/cli' --filter '@autoguide/client' --filter '@autoguide/react' --filter '@autoguide/vite' exec npm version <patch|minor|major> --no-git-tag-version
git add -A
git commit -m "chore: bump publishable package versions"
```

### 2. Build

```bash
pnpm run build
```

### 3. Dry-run pack (verify contents)

```bash
pnpm --filter @autoguide/client pack --pack-destination /tmp/ag-pack
pnpm --filter @autoguide/react pack --pack-destination /tmp/ag-pack
pnpm --filter @autoguide/vite pack --pack-destination /tmp/ag-pack
pnpm --filter @autoguide/cli pack --pack-destination /tmp/ag-pack
```

Inspect each `.tgz` — confirm `package.json` has `private: false`, no `workspace:` protocol in published deps, and `dist/` is included.

### 4. Publish

```bash
# Publish each package (human-gated, no CI automation)
pnpm --filter @autoguide/client publish --access public
pnpm --filter @autoguide/react publish --access public
pnpm --filter @autoguide/vite publish --access public
pnpm --filter @autoguide/cli publish --access public
```

### 5. Tag and push

```bash
git tag v0.1.0  # adjust to actual version
git push origin main --tags
```

### 6. Verify on npm

```bash
npm view @autoguide/react
npm view @autoguide/vite
npm view @autoguide/client
npm view @autoguide/cli
```

### 7. GitHub release

Create a GitHub release from the tag with a changelog summary.

## Workspace protocol note

`workspace:*` in `dependencies` is resolved by pnpm during `pnpm publish` — it replaces the protocol with the actual version range. Verify with `pnpm pack` before publishing.

## Rollback

If a published package has a critical bug:

1. `npm deprecate @autoguide/react@<version> "Known issue: ..."`
2. Bump a patch version and re-publish
3. Do **not** unpublish (npm allows unpublish only within 72h and it's risky)

## Do NOT

- Never publish secrets, `.env`, or `.autoguide/` runtime data
- Never publish from a non-`main` branch without explicit approval
- Never automate publish in CI without human approval
- Never publish all monorepo packages — only the 4 listed above