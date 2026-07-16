# npm Release Checklist (reference)

Copy and track during `@prepare-npm-release`:

```
Release v________

Git & GitHub
- [ ] On main
- [ ] Working tree clean (release-related)
- [ ] origin/main synced (no ahead/behind)
- [ ] Feature PRs merged

Quality
- [ ] pnpm run verify PASS
- [ ] @ecc-check READY (recommended)
- [ ] AgentShield PASS (if .cursor/ changed)

Version
- [ ] All 13 publish packages same version
- [ ] npm registry does not already have target version

Build & pack
- [ ] pnpm run build PASS
- [ ] pnpm pack dry-run — dist/, no workspace:, no secrets

Docs
- [ ] README Recent changes entry
- [ ] First-release note updated (if applicable)
- [ ] docs:api regenerated (if API changed)

GitHub
- [ ] commit chore: release vX.Y.Z
- [ ] tag vX.Y.Z pushed
- [ ] gh release created with changelog

Manual (user)
- [ ] npm whoami / npm login
- [ ] ./scripts/publish-npm.sh (+ OTP)
- [ ] npm view confirms new version
```

## Publish package list

Same order as `scripts/publish-npm.sh`:

1. `@iamthamanic/autoguide-core`
2. `@iamthamanic/autoguide-ui`
3. `@iamthamanic/autoguide-runtime`
4. `@iamthamanic/autoguide-config`
5. `@iamthamanic/autoguide-storage`
6. `@iamthamanic/autoguide-export`
7. `@iamthamanic/autoguide-ai`
8. `@iamthamanic/autoguide-scanner`
9. `@iamthamanic/autoguide-playwright`
10. `@iamthamanic/autoguide-client`
11. `@iamthamanic/autoguide-react`
12. `@iamthamanic/autoguide-vite`
13. `@iamthamanic/autoguide-cli`

## Rollback (after bad publish)

1. `npm deprecate @iamthamanic/autoguide-react@X.Y.Z "Known issue: …"`
2. Patch bump + re-release
3. Do **not** unpublish (72h window, risky)
