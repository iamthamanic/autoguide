# AutoGuide

Documentation intelligence engine — make process-heavy software self-explaining.

SDK, CLI, and runtime UI that generate verifiable documentation from code, DOM, and Playwright traces. See [docs/PRD.md](docs/PRD.md) for product scope, [docs/SPEC_FULL.md](docs/SPEC_FULL.md) for the full engineering specification, and [docs/api/README.md](docs/api/README.md) for public package APIs.

## Prerequisites

- Node.js 20+
- pnpm 9+
- (Optional) Ollama for local AI enrichment
- (Optional) Playwright for scan import

## Setup

```bash
# From repository root
pnpm install
cp .env.example .env   # if present — fill values locally, never commit secrets
```

## Development

```bash
pnpm dev    # starts example React Vite app when available
pnpm build
pnpm typecheck
pnpm test
```

Open [http://localhost:5173](http://localhost:5173) (example app). Integration scenarios under `integrations/` run without external app repos.

## Checks (quality gate)

```bash
pnpm run verify    # deterministic: typecheck + test
```

## CLI (local)

After `autoguide init` and `autoguide scan` in a host project:

```bash
npx autoguide scan --runtime          # optional: capture live DOM at baseUrl (needs running app + Playwright)
npx autoguide scan --runtime-url http://localhost:3000  # override URL for runtime capture only
npx autoguide generate tours            # tours.json from flows (no re-scan)
npx autoguide generate recommendations  # refresh recommendations.json from facts
npx autoguide generate bundle           # tours + recommendations + doc-bundle.json (with runtime artifact list)
npx autoguide sync --target public/autoguide  # copy publish-ready JSON to static target
npx autoguide export --format md
npx autoguide validate
npx autoguide doctor                  # prioritized recommendations + review hints
```

Third-party scanner plugins: add a module path to `plugins` in `autoguide.config.json` (see `examples/stub-plugin/`).

Before commit/PR, run **`@ecc-check`** (review-ticket + AgentShield + optional verify-ui). No shimwrappercheck in this repo.

## Tests

```bash
pnpm test              # unit tests (Vitest)
pnpm run test:e2e      # Playwright — bootstrap via @verify-ui skill
```

## Project structure

```
autoguide/
├── packages/           # @autoguide/core, config, storage, ui, cli
├── plugins/            # @autoguide/react (+ future adapters)
├── examples/           # minimal reference apps (pnpm dev)
├── integrations/       # self-contained scan scenarios (CI fixtures)
├── docs/
│   ├── PRD.md
│   ├── SPEC_FULL.md
│   ├── UI_STYLEGUIDE.md
│   └── api/            # public package API reference
├── .qa/                # design, intake, acceptance, runner config
└── AGENTS.md
```

## Environment variables

Document variables in `.env.example`. Do not commit real secrets.

| Variable | Purpose |
|----------|---------|
| `AUTOGuide_AI_API_KEY` | Optional cloud AI provider key (user-supplied) |
| `AUTOGuide_AI_ENDPOINT` | Optional cloud AI endpoint URL |

## Agent workflow

For AI-assisted development:

1. `@project-setup` — bootstrap (done)
2. `@feature-intake` — epic design + issue slices
3. `@ecc-runner` — autonomous issue pipeline
4. `@implement` — code + acceptance artifact
5. `@ecc-check` — quality gate before ship
6. `@verify-ui` — browser verification

See [AGENTS.md](AGENTS.md).

## License

MIT (TBD)
