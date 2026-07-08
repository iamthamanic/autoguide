# Acceptance: plugin-api-lifecycle

Issue: #81

## Criteria
- [x] Third-party plugin can contribute scan facts
- [x] Plugin output validates against schema
- [x] Registry documents capabilities

## Implementation Notes
- `packages/core/src/plugins/` — lifecycle, compatibility, capability docs
- `packages/cli/src/plugins.ts` — discovery from config paths + builtin registry
- `examples/stub-plugin/index.ts` — sample scan plugin contributing a fact
