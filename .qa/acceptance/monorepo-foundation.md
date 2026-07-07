# Feature: Initialize pnpm monorepo and shared TypeScript config

<!-- seeded by ecc-runner from issue #1 on 2026-07-07 — @implement may refine -->

## Intent
Bootstrap the AutoGuide monorepo with pnpm workspaces, root TypeScript strict config, Vitest placeholder, and CI-ready scripts.

## Happy Path
- [ ] - [ ] `pnpm install` succeeds
- [ ] - [ ] `pnpm typecheck` runs (passes or no-op with no packages)
- [ ] - [ ] Workspace globs include packages/*, plugins/*, examples/*
- [ ] - [ ] tsconfig.base.json has strict: true

## Edge Cases
- [ ] (from .qa/edge-cases.md + @implement)

## Regression
- [ ] Feed and topic routes still load

## Assumptions
- none

## Screenshots
| Step | Filename |
|------|----------|
| 1 | `01-happy-path.png` |

## Implementation Notes
<!-- filled after coding -->
