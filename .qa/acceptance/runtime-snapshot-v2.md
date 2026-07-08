# Feature: Runtime snapshot v2 — forms, modals, route observer

<!-- synced issue #87 -->

## Intent
Collect richer live UI state: forms, dialogs, disabled/loading, text regions, route changes.

## Happy Path
- [x] Snapshot includes form fields with labels
- [x] Snapshot includes open dialogs (`role=dialog`, `aria-modal`)
- [x] Elements expose `disabled` and `loading` state
- [x] Visible text regions captured for main content blocks
- [x] Route observer fires on route change; snapshot records navigation history
- [x] Inspector resolves selected element via stable `id` matching graph entity pattern

## Implementation Notes
- `packages/runtime/src/scanner.ts`, `route-observer.ts`, `types.ts`
