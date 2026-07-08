# Feature: Replace regex-heavy source scanner with TypeScript AST extraction

<!-- synced issue #87 -->

## Intent
Make source scanning deterministic and robust for real codebases.

## Happy Path
- [x] Scanner detects button labels from JSX text/aria without regex
- [x] Scanner links `onClick={approveVacationRequest}` to handler symbol
- [x] Scanner extracts `data-doc-*` attributes via AST
- [x] Tests cover nested components and imported handlers
- [x] `pnpm run verify` passes

## Implementation Notes
- `packages/scanner/src/parse-source-ast.ts` — AST visitors for JSX, routes, handlers, data-doc, DocElement
- `packages/scanner/src/parse-source.test.ts`
