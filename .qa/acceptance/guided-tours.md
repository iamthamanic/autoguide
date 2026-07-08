# Feature: Implement guided tour model and step generation

<!-- synced issue #87 -->

## Intent
Tour model with steps anchored to elements; generate from verified flows.

## Happy Path
- [x] Tour model validates against schema
- [x] At least 1 tour in example app
- [x] Steps highlight correct elements

## Implementation Notes
- `packages/core/src/tours/` — types, generate, validate
- `examples/react-vite` — `TourRunner` + `saveTour`
- `autoguide generate tours` writes `tours.json`
