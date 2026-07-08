# Acceptance: doc-element

Issue: #86

## Criteria
- [x] DocElement sets data-doc-* and registers with provider
- [x] Scanner extracts DocElement props
- [x] Example app uses DocElement on primary action

## Implementation Notes
- `plugins/react/src/DocElement.tsx` — wrapper + provider registration
- `packages/scanner/src/parse-source-ast.ts` — DocElement JSX visitor
- `examples/react-vite/src/main.tsx` — primary action migrated
