# Feature: Fix InspectorOverlay elementFromPoint so inspect selects host elements

## Intent
Inspect-Modus darf Klicks nicht am Overlay selbst abfangen. Ein Klick muss das darunterliegende Host-Element auswählen (dogfood FAIL B4).

## Preconditions
- AutoGuide React adapter in `development` mode with inspector feature enabled
- Inspect mode active (full-screen hit layer present)

## Happy Path
- [ ] Click in inspect mode resolves the underlying host element via `elementsFromPoint` / `elementFromPoint` (not the overlay chrome)
- [ ] Automated test covers host-vs-overlay target resolution
- [ ] German UI strings unchanged
- [ ] `pnpm run verify` passes

## Edge Cases
- [ ] Click with empty hit stack → no match / clear announcement (no throw)
- [ ] Click on overlay-only stack (no host under point) → no host selection
- [ ] Hover highlight targets host element, not the overlay layer

## Regression
- [ ] Escape still closes selection / deactivates inspector
- [ ] Dev menu inspect toggle still works

## Assumptions
- React adapter is the dogfood path; Vue/Svelte parity deferred unless required
- Matching still uses existing `scanDom` + selector `matches`

## Screenshots
| Step | Filename |
|------|----------|
| 1 | `01-happy-path.png` |

## Implementation Notes
- Added `resolveInspectTarget` to skip overlay hit-stack entries.
- `InspectorOverlay` uses `document.elementsFromPoint` for click/hover so host elements are selected.
- Unit tests in `resolveInspectTarget.test.ts`.
