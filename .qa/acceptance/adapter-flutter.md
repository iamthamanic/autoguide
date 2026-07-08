# Feature: Implement Flutter adapter

## Happy Path
- [x] Flutter example documents integration path
- [x] Widget renders in example app
- [x] Architecture doc for core bridge

## Edge Cases
- [x] MVP API parity with React documented
- [x] Scanner stubbed for v1 (AssetCoreBridge)

## Regression
- [x] pnpm run verify for JS monorepo

## Implementation Notes
- `plugins/flutter` Dart package with ported help/search logic
- `examples/flutter_app` Material demo
- CI: `.github/workflows/flutter-adapter.yml`
