# UI Styleguide — AutoGuide (Help Widget & Inspector)

Style tree for runtime UI surfaces embedded in host applications.
Host apps may use their own design system; AutoGuide widget should be themeable but ship sensible defaults.

## Principles

- Unobtrusive: does not block host app workflows
- Confidence visible in `development` mode only
- German UI copy for all user-facing strings
- Every surface: loading, empty, error states

## Design tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--ag-primary` | `#1d4ed8` | Primary actions, brand, active dock |
| `--ag-surface-glass` | frosted white | Dock + panels (`backdrop-filter`) |
| `--ag-radius-lg` | `20px` | Dock shell, panels |
| `--ag-shadow-dock` | layered soft | Bottom dock elevation |
| `--ag-surface-muted` | `#f8fafc` | Secondary panels |
| `--ag-border` | `#e2e8f0` | Panel borders |
| `--ag-text` | `#0f172a` | Body text |
| `--ag-text-muted` | `#64748b` | Metadata, confidence |
| `--ag-warning` | `#d97706` | Low confidence, needs review |
| `--ag-success` | `#16a34a` | Verified facts |
| `--ag-radius` | `8px` | Panels, buttons |
| `--ag-shadow` | `0 4px 24px rgba(0,0,0,0.12)` | Floating widget |

## Typography

| Role | Size | Weight |
|------|------|--------|
| Panel title | 16px | 600 |
| Body | 14px | 400 |
| Metadata | 12px | 400 |
| Step number | 14px | 600 |

## Components

| Component | Location | Notes |
|-----------|----------|-------|
| HelpWidget | `plugins/react/src/AutoGuideBar.tsx` + `AutoGuideWidget.tsx` | Bottom dock + help panel |
| InspectorOverlay | `plugins/react/src/InspectorOverlay.tsx` | Highlight + fact panel |
| ReviewBadge | `plugins/react/src/ReviewBadge.tsx` | Dev-only confidence indicator |
| FlowStepList | `plugins/react/src/FlowStepList.tsx` | Numbered steps |
| Design tokens | `packages/ui/src/tokens.ts` | `--ag-*` CSS variables on widget root |

## Layout

- Dock bar: brand label top-center, icon buttons with labels below
- Panels: centered above bar, 380px desktop, full-width mobile
- Inspector highlight: 2px `--ag-primary` outline

## States (required)

| State | Pattern |
|-------|---------|
| Loading | Skeleton lines + `aria-busy` |
| Empty | „Keine Dokumentation für diese Seite" + Link zu Review |
| Error | Fehlermeldung + Retry |
| Dev-only | Confidence badge + provenance tooltip |

## Accessibility

- Focus trap in open panel
- ESC closes panel and inspector
- Selected element announced via `aria-live`
- WCAG AA contrast minimum

## Do / Don't

**Do**

- Respect `published` vs `development` visibility rules
- Show provenance on hover in dev mode
- Use host app z-index conventions when configurable

**Don't**

- Show raw JSON to end users
- Block clicks on host app unless inspector explicitly active
- Send DOM content to cloud without consent
