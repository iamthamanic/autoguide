# Feature: Configurable dock placement/offset for hosts with bottom navigation

## Intent
Das Help-Dock soll Host-Apps mit Bottom-Navigation nicht überdecken. Konfigurierbarer Offset (minimal API).

## Preconditions
- React adapter with AutoGuide / AutoGuideProvider

## Happy Path
- [ ] `dockBottomOffset` on AutoGuide / AutoGuideProvider raises dock (+ panels) by N px
- [ ] Default `0` keeps previous bottom position
- [ ] README documents the prop briefly
- [ ] Tests cover resolveDockBottom + applied dock style
- [ ] German UI unchanged
- [ ] `pnpm run verify` passes

## Edge Cases
- [ ] Negative offset clamped to 0
- [ ] Panels (Hilfe/Review/Inspector) stay above the raised dock

## Regression
- [ ] Dock still opens Hilfe / Tour without offset

## Assumptions
- Offset-only API is enough (no full placement enum in this ticket)

## Implementation Notes
- `resolveDockBottom` + `dockBottomOffset` on provider/context/AutoGuide
- Style helpers accept bottomOffset; TourRunner uses same bottom
