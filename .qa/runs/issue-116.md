# Issue #116 — npm-publish-ready

- Branch: issue/116-npm-publish-ready
- Set `private: false` on @iamthamanic/autoguide-cli, @iamthamanic/autoguide-client, @iamthamanic/autoguide-react, @iamthamanic/autoguide-vite
- Added `repository`, `license`, `keywords`, `publishConfig` to all 4 packages
- docs/RELEASE.md — human-gated release checklist
- `pnpm pack` dry-run succeeds for all 4 SDK packages
- verify: PASS (pnpm)