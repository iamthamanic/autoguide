# Feature: Initialize pnpm monorepo and shared TypeScript config

<!-- seeded by ecc-runner from issue #1 on 2026-07-07 — synced issue #87 -->

## Intent
Bootstrap the AutoGuide monorepo with pnpm workspaces, root TypeScript strict config, Vitest placeholder, and CI-ready scripts.

## Happy Path
- [x] `pnpm install` succeeds
- [x] `pnpm typecheck` runs (passes across workspace packages)
- [x] Workspace globs include packages/*, plugins/*, examples/*
- [x] tsconfig.base.json has strict: true

## Edge Cases
- [x] Empty or new packages do not break workspace typecheck

## Regression
- [x] `pnpm run verify` passes on main (`.github/workflows/ci.yml`)

## Assumptions
- Node 20+, pnpm 9+

## Implementation Notes
- `pnpm-workspace.yaml`, `tsconfig.base.json`, root `package.json` scripts
- `tests/monorepo.test.ts` guards workspace globs and strict mode
