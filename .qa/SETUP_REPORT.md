# Project Setup Report

**Mode:** init  
**Date:** 2026-07-07  
**Workspace:** `/Users/halteverbotsocialmacpro/Desktop/arsvivai/2-DEV-PROJEKTE/autoguide`

## Discovery Summary

| Field | Value |
|-------|-------|
| App root | `.` (monorepo root) |
| Stack | monorepo (pnpm workspaces) |
| Frontend | planned (`plugins/react`, `examples/react-vite`) |
| Dev URL | http://localhost:5173 |
| Locale | de |

## Artifacts

| File | Action | Notes |
|------|--------|-------|
| docs/PRD.md | created | Grill decisions + MVP cut |
| docs/SPEC_FULL.md | created | Copied from Downloads |
| docs/UI_STYLEGUIDE.md | created | Help Widget / Inspector tokens |
| AGENTS.md | created | Architecture boundaries |
| README.md | created | Monorepo docs |
| .qa/project.yaml | created | locale de |
| .qa/runner-profile.yaml | created | stackProfile monorepo |
| .qa/setup-profile.yaml | created | ponytail enabled |
| .qa/edge-cases.md | created | Global + CLI + Widget cases |
| .qa/design/autoguide-platform.md | created | Epic design |
| .qa/intake/autoguide-platform-issues.md | created | 40 slices DRAFT |
| .qa/intake/autoguide-platform-issues.json | created | For create-github-issues.sh |
| package.json | created | pnpm + checks script |
| pnpm-workspace.yaml | created | packages, plugins, examples |
| tsconfig.base.json | created | strict |
| .env.example | created | AI key + URL placeholders |
| Quality gate | ECC | `@ecc-check` + `pnpm run verify`; no shimwrappercheck |

## PRD Validation

- Problem: ✅
- Goals: ✅
- Non-Goals: ✅
- Users: ✅
- Scope: ✅ (full spec, 5 layers)
- Constraints: ✅

## Feature Intake

- Epic: `.qa/design/autoguide-platform.md`
- Issues: `.qa/intake/autoguide-platform-issues.md` (40 slices, DRAFT)
- JSON: `.qa/intake/autoguide-platform-issues.json`

## Manual follow-up

- [ ] `gh auth login -h github.com` (token currently invalid)
- [ ] Create GitHub remote repo and `git remote add origin …`
- [ ] Review issue draft; say **„Issues anlegen“** to create GitHub issues
- [ ] Initial git commit when ready

## Next step

1. Review `.qa/intake/autoguide-platform-issues.md`
2. Fix `gh auth` + create remote
3. **`Issues anlegen`** or `@feature-intake create autoguide-platform`
4. **`@ecc-runner`** (separately, after issues exist)
