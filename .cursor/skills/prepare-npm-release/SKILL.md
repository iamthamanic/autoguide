---
name: prepare-npm-release
description: >-
  Prepares an AutoGuide npm release end-to-end: git/GitHub sync, quality gate,
  version bump, build, pack dry-run, README/docs, tag, GitHub release — then
  stops for manual npm publish with OTP. Use when user says prepare npm release,
  npm release, release to npm, publish packages, @prepare-npm-release, or
  vorbereiten npm release.
disable-model-invocation: true
---

# Prepare npm Release (AutoGuide)

Prepare **everything** for an npm release. **Do not run `pnpm publish` or `./scripts/publish-npm.sh`** — the user publishes manually after `npm login` / OTP.

**Source of truth:** [docs/RELEASE.md](../../../docs/RELEASE.md), [scripts/publish-npm.sh](../../../scripts/publish-npm.sh), [AGENTS.md](../../../AGENTS.md).

## Exception: main is allowed

Release work **must** land on `main` (tag + push + GitHub release). This overrides the default “never push to main” rule in `@commit-push-safe` / `@commit-pr-safe`.

Prerequisite: feature work is already merged to `main` via PR. Do not release from a feature branch.

## Exit states

| State | Meaning | Next step |
|-------|---------|-----------|
| **READY TO PUBLISH** | All prep done; GitHub tag + release exist | User runs manual npm publish (Phase H) |
| **RESUME PUBLISH** | Tag/release exist; npm still on older version | Skip D/G; verify + Phase H only |
| **BLOCKED** | Missing step, failing check, or ambiguous version | Fix and rerun from failed phase |
| **ALREADY PUBLISHED** | npm already has target version | Bump patch or stop |

## Phase 0 — Read project context

1. Read `docs/RELEASE.md`, `AGENTS.md`, `README.md` (`## Recent changes`).
2. Read `.cursor/readme-contract.md` if present; else `@commit-push-safe` readme-contract (Recent changes format).
3. Determine target version (see Phase D).

Run preflight (non-destructive):

```bash
./.cursor/skills/prepare-npm-release/scripts/preflight.sh
```

Fix every **FAIL** before continuing.

**Resume path:** If preflight shows remote tag `vX.Y.Z` exists, local packages are `X.Y.Z`, but npm registry is older → skip Phases D and G. Verify build/pack (E), README (F if missing entry), GitHub release notes (G verify only), then **RESUME PUBLISH** → Phase H.

## Phase A — Git & GitHub sync

```bash
git fetch origin
git status
git branch --show-current
git rev-parse HEAD
git rev-parse origin/main
git log origin/main..HEAD --oneline
git log HEAD..origin/main --oneline
```

**Checks — fix if failing:**

| Check | Pass criteria | Fix |
|-------|---------------|-----|
| Branch | `main` | Merge open PRs first; checkout `main` |
| Clean tree | no unstaged/uncommitted release blockers | Commit, revert, or ask user |
| Ahead of origin | `git log origin/main..HEAD` empty | `git push origin main` |
| Behind origin | `git log HEAD..origin/main` empty | `git pull --rebase origin main` |
| Open PRs for release | none blocking | Merge or close |

Report: current commit SHA, sync status, open PR count (`gh pr list --state open`).

## Phase B — Quality gate

Run `@ecc-check` until **READY**, or at minimum:

```bash
pnpm run verify
```

If UI packages changed in this release, run `@verify-ui` or document skip.

Optional (when `.cursor/` exists):

```bash
npx ecc-agentshield scan --path .cursor
```

Do not proceed on failing verify.

## Phase C — npm registry baseline

```bash
npm view @iamthamanic/autoguide-cli version 2>/dev/null || echo "not published"
npm view @iamthamanic/autoguide-react version 2>/dev/null || echo "not published"
```

Compare npm latest vs local `packages/cli/package.json` version.

**Do not** require `npm whoami` in prep phases — login is only for manual publish (Phase H).

## Phase D — Version bump

If user did not specify `patch` | `minor` | `major`, ask once. Default: **patch**.

**Publish order** (matches `scripts/publish-npm.sh` — bump ALL of these):

```
packages/core, packages/ui, packages/runtime, packages/config,
packages/storage, packages/export, packages/ai, packages/scanner,
packages/playwright, packages/client, plugins/react, plugins/vite,
packages/cli
```

Bump every package in that list to the **same** version:

```bash
# Example: patch bump on all publishable packages
for dir in packages/core packages/ui packages/runtime packages/config \
  packages/storage packages/export packages/ai packages/scanner \
  packages/playwright packages/client plugins/react plugins/vite packages/cli; do
  (cd "$dir" && npm version patch --no-git-tag-version)
done
```

Record `NEW_VERSION` from any bumped `package.json`.

**Guard:** If npm already has `@iamthamanic/autoguide-cli@NEW_VERSION`, stop → **ALREADY PUBLISHED** or bump again.

## Phase E — Build & pack dry-run

```bash
pnpm run build
```

Dry-run pack (verify tarball contents):

```bash
rm -rf /tmp/ag-pack && mkdir -p /tmp/ag-pack
pnpm --filter @iamthamanic/autoguide-client pack --pack-destination /tmp/ag-pack
pnpm --filter @iamthamanic/autoguide-react pack --pack-destination /tmp/ag-pack
pnpm --filter @iamthamanic/autoguide-vite pack --pack-destination /tmp/ag-pack
pnpm --filter @iamthamanic/autoguide-cli pack --pack-destination /tmp/ag-pack
tar -tzf /tmp/ag-pack/iamthamanic-autoguide-cli-*.tgz | head -30
```

**Inspect each `.tgz`:**

- [ ] `"private": false` (or absent) in published `package.json`
- [ ] No raw `workspace:` in published deps (pnpm resolves on publish)
- [ ] `dist/` present
- [ ] No `.env`, `.autoguide/`, secrets

## Phase F — README & docs

Update when releasing (required for user-facing packages):

1. **README.md**
   - Append `## Recent changes` line: `- **YYYY-MM-DD** — Release vX.Y.Z (@iamthamanic/autoguide-*)`
   - If first npm release: remove or update the “Bis zum ersten npm-Release” workspace note in install section
   - Ensure install commands show `@iamthamanic/autoguide-*` versions if documented
2. **docs/RELEASE.md** — only if process changed (usually skip)
3. **docs/api/** — run `pnpm run docs:api` if public API changed this cycle

Follow readme-contract: 1–3 bullets max in Recent changes; dedupe to 10 entries.

## Phase G — Commit, tag, push, GitHub release

**Only after Phases A–F pass.**

```bash
git add -A
git commit -m "chore: release vNEW_VERSION"
git tag "vNEW_VERSION"
git push origin main
git push origin "vNEW_VERSION"
```

Create GitHub release (use `gh`):

```bash
gh release create "vNEW_VERSION" \
  --title "vNEW_VERSION" \
  --notes "$(cat <<'EOF'
## Highlights

- …

## Packages

- @iamthamanic/autoguide-cli@NEW_VERSION
- @iamthamanic/autoguide-client@NEW_VERSION
- @iamthamanic/autoguide-react@NEW_VERSION
- @iamthamanic/autoguide-vite@NEW_VERSION

## Install

\`\`\`bash
npm install @iamthamanic/autoguide-react @iamthamanic/autoguide-vite
npm install -D @iamthamanic/autoguide-cli
\`\`\`
EOF
)"
```

Fill **Highlights** from commits since last tag:

```bash
git log "$(git describe --tags --abbrev=0 HEAD^ 2>/dev/null || echo '')"..HEAD --oneline
```

If release already exists for tag, verify notes are complete; update with `gh release edit` if needed.

**Verify GitHub:**

```bash
gh release view "vNEW_VERSION"
git ls-remote --tags origin | grep "vNEW_VERSION"
```

## Phase H — Manual npm publish (USER ONLY)

**Stop the agent here.** Print this block verbatim for the user:

```markdown
## Ready to publish — manual step

1. Login (if needed):
   npm whoami || npm login

2. Publish (interactive OTP per package):
   ./scripts/publish-npm.sh

   Or pass OTP once:
   NPM_OTP=123456 ./scripts/publish-npm.sh

3. Verify:
   npm view @iamthamanic/autoguide-react version
   npm view @iamthamanic/autoguide-cli version
```

**Agent must NOT** run publish commands (no OTP, no token handling).

## Final report template

```markdown
# npm Release Prep Report

Version:     vNEW_VERSION
Git:         main @ SHA (synced with origin)
Verify:      PASS
Pack:        PASS (tarballs in /tmp/ag-pack)
README:      updated | skipped — reason
Git tag:     vNEW_VERSION pushed
GitHub:      release URL
npm registry: previous X.Y.Z → publishing NEW_VERSION (pending)

Status: READY TO PUBLISH — run Phase H manually
```

## Do NOT

- Never publish from CI or agent session
- Never publish secrets, `.env`, or `.autoguide/` data
- Never unpublish on npm (use `npm deprecate` + patch per RELEASE.md)
- Never skip verify because “it's just a version bump”

## Related skills

- `@ecc-check` — quality gate before release prep
- `@commit-pr-safe` — merge feature work before release
- `@verification-loop` — fallback if ecc-check unavailable

## Additional resources

- Detailed checklist: [checklist.md](checklist.md)
- Preflight script: [scripts/preflight.sh](scripts/preflight.sh)
