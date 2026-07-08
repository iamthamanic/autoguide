# AutoGuide — Product Requirements Document

**Version:** 0.1  
**Status:** Draft (intake-approved decisions)  
**Full engineering spec:** [SPEC_FULL.md](./SPEC_FULL.md)

---

## Problem

Process-heavy business applications (HR, operations, admin dashboards) change faster than their documentation. Knowledge is fragmented across UI labels, backend rules, roles, and tribal knowledge. Developers who build with AI assistants ship features quickly but cannot explain them later without long training sessions.

## Goal

Build a reusable open-source **Documentation Intelligence Engine** that turns the application itself into the primary source for verifiable documentation — with provenance, confidence scores, and developer review before end-user exposure.

**Wow moment (90 days):** A developer runs `npx autoguide scan` on their React app and gets exportable step-by-step flow documentation good enough to onboard employees without manual training.

## Primary user (first 90 days)

- **Buyer & builder:** Fullstack / AI-assisted developer who installs AutoGuide themselves
- **Reviewer:** Same developer (only dev sees uncertain content in `development` mode)
- **End users:** See documentation only after explicit `published` mode

## Non-goals (product)

- Not a wiki, generic chatbot, screenshot recorder, or test framework replacement
- Not a hosted SaaS dependency for core functionality
- Not modifying host application business logic without developer action
- Not sending HR/person data to cloud AI by default

## Architectural scope

**Target:** Full Combined Spec (all adapters, plugins, future features) as **architecture end-state**.

**Delivery:** Five layers — interfaces first, vertical slices, React reference implementation before other adapters.

| Layer | Scope |
|-------|-------|
| 1 | Core, config, storage, CLI, JSON schemas, React adapter skeleton |
| 2 | Runtime scanner, source scanner, confidence, review, inspector |
| 3 | Playwright import, AI enrichment, export |
| 4 | Help widget, search, guided tours, publish gate |
| 5 | Vue/Angular/Svelte → Tauri → Flutter → Hosted sync, SSO, enterprise |

## Key product decisions (grill-me, locked)

| Decision | Choice |
|----------|--------|
| Scope | Full spec architecturally; phased delivery in 5 layers |
| Reference integration scenario | **`integrations/hr-workflows`** (in-repo fixtures; CI) |
| External validation (optional) | browo-hr, sagadrive, scriptony — manual only, not repo deps |
| Visibility modes | `development` (dev sees all) / `published` (approved facts only) |
| Publish gate | Manual `publish`; end-user sees `review_status: approved` AND `confidence >= 0.85` |
| Playwright | Import existing test traces first; own crawl as fallback |
| Wow acceptance | ≥3 complete step-by-step flows in `integrations/hr-workflows`, exportable Markdown/PDF |
| AI default | Ollama local |
| AI cloud | Opt-in; user provides **API key + endpoint URL**; explicit warning for PII |
| API costs | Each user brings own keys; AutoGuide does not host AI |
| Tauri (scriptony) | Layer 5 — not blocking React reference |

## MVP 0.1 cut (Ponytail Rung 1 — first issues only)

**In scope for first vertical slice batch:**

- pnpm monorepo, `@autoguide/core` types, config loader, storage writer
- CLI: `init`, `doctor`, `scan` skeleton
- JSON schemas + `.autoguide/` output
- React provider + Help Widget placeholder
- Example Vite React app

**Explicitly deferred to later issues (not Rung 1):**

- Vue, Angular, Svelte, Tauri, Flutter adapters *(scaffold packages exist; full parity checklists open)*
- Hosted sync, SSO, enterprise registry, analytics dashboard
- External dogfood validation (browo-hr, scriptony) as CI dependencies

## Delivery status (Phase 2–3, synced 2026-07)

**Shipped beyond MVP 0.1:**

| Area | Status |
|------|--------|
| Monorepo + `@autoguide/core` | ✅ `pnpm run verify` on main |
| CLI | ✅ init, doctor, scan, review, generate, export, validate, publish |
| CI validation | ✅ `autoguide validate` + `.github/workflows/validate-docs.yml` |
| hr-workflows integration | ✅ 3 flows, German Markdown/HTML export (`hr-workflows.integration.test.ts`) |
| Playwright | ✅ import + `scan --verify-flows` |
| JSON Schema | ✅ committed schemas + Ajv in CLI |
| Source scanner | ✅ TypeScript AST (`parse-source-ast.ts`) |
| Runtime snapshot | ✅ v2 forms/dialogs/route observer |
| Review loop | ✅ edit + re-verify + `review-history.json` |
| Redaction | ✅ PII/secret patterns in storage/export/AI |
| Plugin API | ✅ lifecycle + config discovery |
| Recommendations | ✅ engine + doctor + review links |
| Guided tours | ✅ model, `generate tours`, example `TourRunner` |
| Export | ✅ Markdown, HTML, PDF |
| React SDK | ✅ Widget, Inspector, DocElement, `@autoguide/ui` tokens |
| Public API docs | ✅ `docs/api/` |

**Still deferred (accurate as of Phase 3 sync):**

- Hosted sync, SSO, enterprise registry, analytics dashboard
- Tauri production dogfood (scriptony-multihost)
- Flutter beyond stub/example package
- Vue/Angular/Svelte **full** parity vs React (widgets exist, checklists incomplete)
- Mandatory cloud AI or AutoGuide-hosted backends

## Required capabilities (full product)

See [SPEC_FULL.md](./SPEC_FULL.md) for complete PRD/TRD:

- Installable SDK + framework adapters
- Runtime, source, and Playwright scanning
- Knowledge graph with confidence + verification
- Help widget, inspector, search, guided tours
- AI provider abstraction (Ollama + OpenAI-compatible cloud)
- Plugin API, exports, version-aware history

## Principles

- local-first, open-source-first
- deterministic-before-AI
- plugin-based, reviewable, version-aware
- `@autoguide/core` must not import React, Vue, DOM, or Node-specific APIs without abstraction

## Integration scenarios (in-repo)

| Scenario | Path | Role |
|----------|------|------|
| HR workflows | `integrations/hr-workflows` | CI + realistic multi-role flows |

## Optional external validation

Real apps for manual checks only — not required for build or CI.

| App | Role | When |
|-----|------|------|
| browo-hr | Optional HR app realism | Layer 2+ |
| sagadrive | Supabase/BaaS validation | Layer 4+ |
| scriptony-multihost | Tauri adapter validation | Layer 5 |

## Acceptance (product-level)

AutoGuide is accepted when (see SPEC_FULL.md for detail):

- React app installs AutoGuide; scan produces structured `.autoguide/` knowledge
- Dev reviews uncertain facts; reviewed knowledge cannot be overwritten by AI
- `published` mode shows only approved content to end users
- ≥3 flows documented end-to-end via `integrations/hr-workflows` (checked-in fixtures)
- Core works without cloud; AI is optional enhancement
- All public JSON validates against schema

## Constraints

- TypeScript strict mode
- pnpm monorepo
- JSON source of truth; SQLite index/cache
- German UI copy for user-facing strings
- English code and commits

## References

- [SPEC_FULL.md](./SPEC_FULL.md) — complete engineering specification v0.1
- [UI_STYLEGUIDE.md](./UI_STYLEGUIDE.md) — Help Widget / Inspector styling
- [.qa/design/autoguide-platform.md](../.qa/design/autoguide-platform.md) — epic design
