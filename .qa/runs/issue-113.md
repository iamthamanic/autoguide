# Issue #113 — doc-bundle-sync

- Branch: issue/113-doc-bundle-sync
- Extended `doc-bundle.json` manifest with `runtimeArtifacts` list
- New `autoguide sync --target <dir> [--clean]` CLI command
- Tests: 4 new sync tests (copy, mkdir, clean, missing .autoguide)
- verify: PASS (pnpm)