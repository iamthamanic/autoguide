# Issue #116 — npm-publish-ready

- Branch: issue/116-npm-publish-ready
- Set `private: false` on @autoguide/cli, @autoguide/client, @autoguide/react, @autoguide/vite
- Added `repository`, `license`, `keywords`, `publishConfig` to all 4 packages
- docs/RELEASE.md — human-gated release checklist
- `pnpm pack` dry-run succeeds for all 4 SDK packages
- verify: PASS (pnpm)