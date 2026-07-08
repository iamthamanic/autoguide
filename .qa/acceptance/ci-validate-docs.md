# Feature: Implement CI documentation validation command

<!-- seeded by ecc-runner from issue #40 -->

## Intent
CI command fails build when docs invalid or stale beyond threshold.

## Happy Path
- [x] validate exits non-zero on schema failure
- [x] Example workflow in .github/workflows/
- [x] Documented for integrations/hr-workflows

## Edge Cases
- [x] validate --soft for warnings only

## Regression
- [x] scan/export/publish commands unchanged

## Assumptions
- Default max stale facts: 0

## Implementation Notes
- `autoguide validate` with `--soft`, `--json`, `--max-stale`
- Workflow: `.github/workflows/validate-docs.yml`
