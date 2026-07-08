# Public API Reference

Curated reference for AutoGuide packages. Regenerate export tables with:

```bash
pnpm run docs:api
```

## Packages

| Package | Doc |
|---------|-----|
| `@autoguide/core` | [core.md](./core.md) |
| `@autoguide/cli` | [cli.md](./cli.md) |
| `@autoguide/react` | [react.md](./react.md) |

## Boundaries

- **core** — no framework imports; shared by CLI and adapters
- **cli** — Node-only; orchestrates scan, storage, export
- **react** — browser SDK; consumes core types and `.autoguide/` artifacts

See also [SPEC_FULL.md](../SPEC_FULL.md) and [AGENTS.md](../../AGENTS.md).
