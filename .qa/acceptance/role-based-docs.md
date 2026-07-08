# Feature: Implement role-based documentation filtering

<!-- seeded by ecc-runner from issue #38 -->

## Intent
Filter docs by userRole prop and fact role metadata.

## Happy Path
- [x] userRole prop filters content
- [x] Export can target single role
- [x] HR role example documented in integrations/hr-workflows

## Edge Cases
- [x] Missing role shows safe default (all visible)

## Regression
- [x] Help context and search still resolve routes

## Assumptions
- Playwright suite titles infer `Mitarbeiter` / `HR-Admin` roles

## Implementation Notes
- `@autoguide/core`: `filterByRole`, `filterFactsByRole`, optional `Fact.roleIds`
- Export/CLI: `--role` flag
- Widgets pass `userRole` to `searchKnowledge`
