# Integrations

Self-contained scan scenarios with checked-in fixtures. Used by CI and `pnpm test` — **no external app repos required**.

| Scenario | Path | Purpose |
|----------|------|---------|
| HR workflows | [hr-workflows/](hr-workflows/) | Multi-role flows, Playwright report import, German export |

`examples/` shows minimal SDK integration; `integrations/` shows realistic end-to-end scan output.

Optional manual validation against real apps (e.g. browo-hr) is documented in each scenario's README — those apps live outside this repository.
