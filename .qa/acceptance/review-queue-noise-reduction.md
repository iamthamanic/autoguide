# Feature: Reduce review queue noise from generic handlers

## Intent
Review-Queue nicht mit generischen Handlern (handleSubmit etc.) überfluten — echte Doc-Kandidaten behalten.

## Happy Path
- [ ] Generic handler facts filtered from automatic review seed
- [ ] Real label/action candidates still appear
- [ ] Recommendations still flag generic handler naming
- [ ] Tests cover filter/down-rank
- [ ] `pnpm run verify` passes

## Edge Cases
- [ ] Stale generic facts remain visible but down-ranked
- [ ] Meaningful names like submitVacationRequest are not filtered

## Implementation Notes
- Shared `isGenericHandlerName` / `isGenericHandlerNoiseFact`
- ReviewQueue.seedFromFacts skips generic noise; list sorts by priority
