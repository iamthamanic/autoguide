# Feature: Replace regex-heavy source scanner with TypeScript AST extraction

<!-- seeded by ecc-runner from issue #68 on 2026-07-08 — @implement may refine -->

## Intent
Make source scanning deterministic and robust for real codebases.

## Happy Path
- [ ] - [ ] Scanner detects button labels from JSX text/aria without regex
- [ ] - [ ] Scanner links `onClick={approveVacationRequest}` to handler symbol
- [ ] - [ ] Scanner extracts `data-doc-*` attributes via AST
- [ ] - [ ] Tests cover nested components and imported handlers
- [ ] - [ ] `pnpm run verify` passes

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
- `packages/scanner/src/parse-source-ast.ts` — AST visitors for JSX, routes, handlers, data-doc
- `packages/scanner/src/parse-source.ts` — delegates to AST; regex removed
- `packages/scanner/src/types.ts` — `handlerDeclarationLine`, `buttonLabel`
- Tests: nested components, handler line resolution, object literal routes
