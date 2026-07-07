# AutoGuide Platform — Issue Slices (DRAFT)

Epic design: [.qa/design/autoguide-platform.md](../design/autoguide-platform.md)

**Status:** DRAFT — review before `Issues anlegen`

| # | Priority | Title | Depends on |
|---|----------|-------|------------|
| 1 | P0 | Initialize pnpm monorepo and shared TypeScript config | — |
| 2 | P0 | Define core types and fact model in @autoguide/core | Initialize pnpm monorepo and shared TypeScript config |
| 3 | P0 | Implement config schema and loader | Initialize pnpm monorepo and shared TypeScript config |
| 4 | P0 | Implement JSON storage writer and SQLite index skeleton | Define core types and fact model in @autoguide/core; Implement config schema and loader |
| 5 | P0 | Define JSON schemas for knowledge artifacts | Define core types and fact model in @autoguide/core |
| 6 | P0 | Implement CLI init and doctor commands | Implement config schema and loader; Implement JSON storage writer and SQLite index skeleton |
| 7 | P0 | Create React adapter provider and widget placeholder | Define core types and fact model in @autoguide/core; Implement JSON storage writer and SQLite index skeleton |
| 8 | P0 | Create example React Vite reference app | Create React adapter provider and widget placeholder |
| 9 | P0 | Implement runtime DOM traversal and accessibility extraction | Create React adapter provider and widget placeholder |
| 10 | P0 | Implement runtime snapshot serializer and selector generator | Implement runtime DOM traversal and accessibility extraction |
| 11 | P0 | Implement Inspector overlay and element fact panel | Implement runtime snapshot serializer and selector generator |
| 12 | P1 | Implement source scanner TSX parser and route detection | Define core types and fact model in @autoguide/core; Implement JSON storage writer and SQLite index skeleton |
| 13 | P1 | Implement component handler extraction and data-doc parsing | Implement source scanner TSX parser and route detection |
| 14 | P1 | Merge source and runtime facts into knowledge graph | Implement runtime snapshot serializer and selector generator; Implement component handler extraction and data-doc parsing |
| 15 | P0 | Implement confidence scoring engine | Merge source and runtime facts into knowledge graph |
| 16 | P0 | Implement review queue and manual override persistence | Implement confidence scoring engine |
| 17 | P0 | Implement development and published visibility modes | Implement review queue and manual override persistence; Create React adapter provider and widget placeholder |
| 18 | P1 | Implement Playwright trace import from existing tests | Implement JSON storage writer and SQLite index skeleton; Implement CLI init and doctor commands |
| 19 | P1 | Implement AutoGuide crawl fallback for uncovered routes | Implement Playwright trace import from existing tests |
| 20 | P1 | Implement flow candidate generation from traces | Implement Playwright trace import from existing tests; Implement AutoGuide crawl fallback for uncovered routes |
| 21 | P1 | Implement AI provider interface and Ollama adapter | Define core types and fact model in @autoguide/core |
| 22 | P1 | Implement OpenAI-compatible cloud provider with API key and URL | Implement AI provider interface and Ollama adapter |
| 23 | P1 | Implement AI output validation and ai_proposal marking | Implement OpenAI-compatible cloud provider with API key and URL; Implement review queue and manual override persistence |
| 24 | P0 | Implement CLI scan command full pipeline | Merge source and runtime facts into knowledge graph; Implement confidence scoring engine; Implement CLI init and doctor commands |
| 25 | P1 | Implement CLI review command | Implement review queue and manual override persistence; Implement CLI init and doctor commands |
| 26 | P1 | Implement Markdown documentation export | Implement development and published visibility modes; Implement CLI scan command full pipeline |
| 27 | P1 | Implement Help Center with context resolution | Implement development and published visibility modes; Create React adapter provider and widget placeholder |
| 28 | P1 | Implement deterministic search index | Implement Markdown documentation export; Implement Help Center with context resolution |
| 29 | P0 | Implement CLI publish command | Implement development and published visibility modes; Implement Help Center with context resolution |
| 30 | P2 | Implement guided tour model and step generation | Implement flow candidate generation from traces; Implement Help Center with context resolution |
| 31 | P2 | Implement recommendation engine | Implement confidence scoring engine; Implement review queue and manual override persistence |
| 32 | P2 | Implement Vue adapter | Create React adapter provider and widget placeholder; Implement development and published visibility modes |
| 33 | P2 | Implement Angular adapter | Create React adapter provider and widget placeholder; Implement development and published visibility modes |
| 34 | P2 | Implement Svelte adapter | Create React adapter provider and widget placeholder; Implement development and published visibility modes |
| 35 | P2 | Implement Tauri adapter | Create React adapter provider and widget placeholder; Implement development and published visibility modes |
| 36 | P2 | Implement plugin API and registry | Define core types and fact model in @autoguide/core |
| 37 | P2 | Implement HTML and PDF export | Implement Markdown documentation export |
| 38 | P2 | Implement role-based documentation filtering | Implement review queue and manual override persistence; Implement Help Center with context resolution |
| 39 | P2 | Implement version-aware change history | Implement development and published visibility modes; Implement JSON storage writer and SQLite index skeleton |
| 40 | P2 | Implement CI documentation validation command | Implement CLI scan command full pipeline; Define JSON schemas for knowledge artifacts |
| 41 | P0 | Validate browo-hr integration with three complete flows | Implement Markdown documentation export; Implement CLI publish command; Implement CLI scan command full pipeline |
| 42 | P2 | Implement Flutter adapter | Define core types and fact model in @autoguide/core |

---

## Slices

### 1. Initialize pnpm monorepo and shared TypeScript config

- **Priority:** P0
- **Feature slug:** `monorepo-foundation`
- **Labels:** P0

## Intent
Bootstrap the AutoGuide monorepo with pnpm workspaces, root TypeScript strict config, Vitest placeholder, and CI-ready scripts.

## User Journey
1. Developer clones repo
2. Runs `pnpm install` and `pnpm typecheck`
3. Monorepo structure is ready for packages

## Problem
Empty repo has no build foundation for @autoguide packages.

## Solution
Add pnpm-workspace.yaml, tsconfig.base.json, root package.json scripts (build, typecheck, test, checks), packages/plugins/examples dirs.

## Runtime
| Axis | This slice |
|------|------------|
| Local | yes |
| Cloud | skip |
| Tauri | skip |

## Edge Cases
- Empty workspace packages should not break typecheck
- Node 20+ engine constraint documented

## Acceptance
- [ ] `pnpm install` succeeds
- [ ] `pnpm typecheck` runs (passes or no-op with no packages)
- [ ] Workspace globs include packages/*, plugins/*, examples/*
- [ ] tsconfig.base.json has strict: true

## Design
Epic: `.qa/design/autoguide-platform.md`

---

### 2. Define core types and fact model in @autoguide/core

- **Priority:** P0
- **Feature slug:** `core-types-fact-model`
- **Labels:** P0
- **Depends on:** Initialize pnpm monorepo and shared TypeScript config

## Intent
Create framework-agnostic core types: Fact, Feature, Page, Flow, Provenance, Confidence, ReviewStatus.

## User Journey
1. Developer imports types from @autoguide/core
2. Types validate fact shape with provenance metadata

## Problem
No shared vocabulary for knowledge artifacts across scanners and UI.

## Solution
packages/core with exported types, zod or JSON-schema-aligned interfaces, no React/DOM imports.

## Runtime
| Axis | This slice |
|------|------------|
| Local | yes |

## Edge Cases
- Fact IDs stable across rescans
- ai_proposal vs manual_override distinguished

## Acceptance
- [ ] packages/core builds standalone
- [ ] No React/DOM/Node-specific imports in core
- [ ] Fact type includes provenance, confidence, review_status
- [ ] Unit tests for type guards/validators

## Design
Epic: `.qa/design/autoguide-platform.md`

---

### 3. Implement config schema and loader

- **Priority:** P0
- **Feature slug:** `config-schema-loader`
- **Labels:** P0
- **Depends on:** Initialize pnpm monorepo and shared TypeScript config

## Intent
Define autoguide.config.ts schema with defineAutoGuideConfig, defaults, and validation.

## User Journey
1. Dev runs autoguide init
2. Config file generated with appId, framework, baseUrl, mode, ai settings

## Problem
CLI and SDK need typed configuration with sensible defaults.

## Solution
packages/config with schema, loader, validation errors; support mode development|published, ai provider ollama|openai-compatible with endpoint+apiKey.

## Runtime
| Axis | This slice |
|------|------------|
| Local | yes |

## Edge Cases
- Secrets from env not written to config file
- Invalid config returns clear German error messages

## Acceptance
- [ ] defineAutoGuideConfig helper exported
- [ ] Validates required fields
- [ ] AI cloud fields optional (apiKey, endpoint)
- [ ] mode defaults to development

## Design
Epic: `.qa/design/autoguide-platform.md`

---

### 4. Implement JSON storage writer and SQLite index skeleton

- **Priority:** P0
- **Feature slug:** `storage-json-sqlite`
- **Labels:** P0
- **Depends on:** Define core types and fact model in @autoguide/core, Implement config schema and loader

## Intent
Persist knowledge to .autoguide/ as JSON (SoT) with SQLite index for search.

## User Journey
1. Scan completes
2. features.json, pages.json, flows.json written atomically
3. SQLite index updated for queries

## Problem
Knowledge needs durable local storage without cloud dependency.

## Solution
packages/storage: atomic JSON writes, SQLite schema skeleton per SPEC_FULL, storage abstraction interface.

## Runtime
| Axis | This slice |
|------|------------|
| Local | yes |

## Edge Cases
- Partial write failure rolls back
- Missing .autoguide dir created on init

## Acceptance
- [ ] JSON files validate against schemas
- [ ] Atomic write helper tested
- [ ] SQLite tables created idempotently
- [ ] No secrets in stored artifacts

## Design
Epic: `.qa/design/autoguide-platform.md`

---

### 5. Define JSON schemas for knowledge artifacts

- **Priority:** P0
- **Feature slug:** `json-schemas`
- **Labels:** P0
- **Depends on:** Define core types and fact model in @autoguide/core

## Intent
Publish JSON schemas for features, pages, flows, confidence, provenance artifacts.

## User Journey
1. CLI generates output
2. Output validates against committed schemas

## Problem
Without schemas, scanner outputs drift and break consumers.

## Solution
packages/core/schemas/*.json + validation helper used by CLI and tests.

## Runtime
| Axis | This slice |
|------|------------|
| Local | yes |

## Edge Cases
- Schema version field for future migrations

## Acceptance
- [ ] Schemas cover MVP artifacts from SPEC_FULL
- [ ] Validation function returns structured errors
- [ ] CI can validate sample fixtures

## Design
Epic: `.qa/design/autoguide-platform.md`

---

### 6. Implement CLI init and doctor commands

- **Priority:** P0
- **Feature slug:** `cli-init-doctor`
- **Labels:** P0
- **Depends on:** Implement config schema and loader, Implement JSON storage writer and SQLite index skeleton

## Intent
CLI commands: autoguide init (detect framework, write config) and autoguide doctor (health checks).

## User Journey
1. Dev runs npx autoguide init in React Vite project
2. autoguide.config.ts and .autoguide/ created
3. doctor reports missing deps

## Problem
No entry point for developers to bootstrap AutoGuide.

## Solution
packages/cli with commander/yargs, init + doctor, non-zero exit on failure.

## Runtime
| Axis | This slice |
|------|------------|
| Local | yes |

## Edge Cases
- init is idempotent
- doctor detects missing Playwright/Ollama optionally

## Acceptance
- [ ] init creates config + output dir
- [ ] doctor exits 0 when healthy, non-zero on issues
- [ ] Framework detection for Vite React

## Design
Epic: `.qa/design/autoguide-platform.md`

---

### 7. Create React adapter provider and widget placeholder

- **Priority:** P0
- **Feature slug:** `react-adapter-skeleton`
- **Labels:** P0
- **Depends on:** Define core types and fact model in @autoguide/core, Implement JSON storage writer and SQLite index skeleton

## Intent
Ship @autoguide/react with AutoGuideProvider, AutoGuideWidget placeholder, context, hooks.

## User Journey
1. Dev wraps app in AutoGuideProvider
2. Help widget FAB renders without throwing when docs missing

## Problem
Host apps need embeddable SDK entry point.

## Solution
plugins/react: Provider, Widget shell, load docs from bundle/URL, dev mode badge.

## Runtime
| Axis | This slice |
|------|------------|
| Local | yes |

## Edge Cases
- No throw if .autoguide missing
- Works Vite React without Next.js

## Acceptance
- [ ] AutoGuideProvider exports documented API
- [ ] Widget renders FAB + empty state in German
- [ ] React Testing Library smoke test

## Design
Epic: `.qa/design/autoguide-platform.md`

---

### 8. Create example React Vite reference app

- **Priority:** P0
- **Feature slug:** `example-react-vite`
- **Labels:** P0
- **Depends on:** Create React adapter provider and widget placeholder

## Intent
Minimal Vite React example app with routes, buttons, AutoGuide integrated for local dev.

## User Journey
1. Dev runs pnpm dev from root
2. Example app loads with widget visible

## Problem
No isolated host for adapter development and verify-ui.

## Solution
examples/react-vite with 2-3 routes, sample actions, AutoGuideProvider wired.

## Runtime
| Axis | This slice |
|------|------------|
| Local | yes |

## Edge Cases
- Port 5173 documented in README

## Acceptance
- [ ] pnpm dev starts example on :5173
- [ ] Widget visible in example
- [ ] At least 2 routes navigable

## Design
Epic: `.qa/design/autoguide-platform.md`

---

### 9. Implement runtime DOM traversal and accessibility extraction

- **Priority:** P0
- **Feature slug:** `runtime-dom-a11y`
- **Labels:** P0
- **Depends on:** Create React adapter provider and widget placeholder

## Intent
Passive runtime scan: DOM traversal, interactive element detection, a11y tree collection.

## User Journey
1. App runs with SDK
2. Runtime scanner captures visible elements and labels

## Problem
Need runtime evidence for facts without AI.

## Solution
Runtime scanner module in plugins/react or packages/runtime; bridge to core fact format.

## Runtime
| Axis | This slice |
|------|------------|
| Local | yes |

## Edge Cases
- Shadow DOM partial support
- Dynamic UI mutations debounced

## Acceptance
- [ ] Detects buttons, links, inputs with accessible names
- [ ] Outputs runtime snapshot JSON
- [ ] Mutation observer does not leak memory

## Design
Epic: `.qa/design/autoguide-platform.md`

---

### 10. Implement runtime snapshot serializer and selector generator

- **Priority:** P0
- **Feature slug:** `runtime-snapshot-selectors`
- **Labels:** P0
- **Depends on:** Implement runtime DOM traversal and accessibility extraction

## Intent
Serialize runtime state to stable selectors and element graph for inspector and Playwright.

## User Journey
1. Scan runs
2. Each element gets stable selector + graph edges to page/route

## Problem
Inspector and verification need stable element identity.

## Solution
Selector generator (data-autoguide-* preferred, fallback CSS), graph serializer.

## Runtime
| Axis | This slice |
|------|------------|
| Local | yes |

## Edge Cases
- Prefer data-autoguide-id when present
- Fragile selectors flagged low confidence

## Acceptance
- [ ] Snapshot persisted to .autoguide/
- [ ] Selectors reproducible across rescans
- [ ] Unit tests for selector stability

## Design
Epic: `.qa/design/autoguide-platform.md`

---

### 11. Implement Inspector overlay and element fact panel

- **Priority:** P0
- **Feature slug:** `inspector-overlay`
- **Labels:** P0
- **Depends on:** Implement runtime snapshot serializer and selector generator

## Intent
Inspector mode: hover/select elements, show facts, confidence, provenance in dev mode.

## User Journey
1. Dev toggles Inspector
2. Clicks button
3. Sees fact panel with evidence sources

## Problem
Developers need in-app review of detected knowledge.

## Solution
InspectorOverlay component, toggle hotkey, fact panel per UI_STYLEGUIDE.

## Runtime
| Axis | This slice |
|------|------------|
| Local | yes |

## Edge Cases
- Inspector does not trigger destructive clicks
- ESC exits inspector

## Acceptance
- [ ] Toggle inspector on/off
- [ ] Element selection shows facts
- [ ] Confidence badge dev-only
- [ ] German UI strings

## Design
Epic: `.qa/design/autoguide-platform.md`

---

### 12. Implement source scanner TSX parser and route detection

- **Priority:** P1
- **Feature slug:** `source-scanner-routes`
- **Labels:** P1
- **Depends on:** Define core types and fact model in @autoguide/core, Implement JSON storage writer and SQLite index skeleton

## Intent
Static analysis: walk TSX files, detect routes (react-router etc.), extract page candidates.

## User Journey
1. CLI scan includes source pass
2. pages.json populated from route definitions

## Problem
Runtime alone misses routes not visited.

## Solution
packages/cli source scanner with TS parser, route scanner plugin for React Router.

## Runtime
| Axis | This slice |
|------|------------|
| Local | yes |

## Edge Cases
- Lazy routes detected from import graph
- Monorepo frontend path configurable

## Acceptance
- [ ] Detects routes in example app and browo-hr structure
- [ ] Outputs page candidates with file provenance
- [ ] No execution of user code

## Design
Epic: `.qa/design/autoguide-platform.md`

---

### 13. Implement component handler extraction and data-doc parsing

- **Priority:** P1
- **Feature slug:** `source-scanner-handlers`
- **Labels:** P1
- **Depends on:** Implement source scanner TSX parser and route detection

## Intent
Extract component names, onClick handlers, data-doc and data-autoguide-* attributes.

## User Journey
1. Source scan enriches element facts with handler names and explicit metadata

## Problem
Higher confidence requires source-level evidence.

## Solution
AST visitor for handlers, attribute extraction, merge rules per evidence hierarchy.

## Runtime
| Axis | This slice |
|------|------------|
| Local | yes |

## Edge Cases
- Ambiguous handler names flagged for review
- data-doc-* boosts confidence

## Acceptance
- [ ] Extracts handlers from example app
- [ ] Explicit metadata facts score >= 0.95
- [ ] Ambiguous handlers create review items

## Design
Epic: `.qa/design/autoguide-platform.md`

---

### 14. Merge source and runtime facts into knowledge graph

- **Priority:** P1
- **Feature slug:** `knowledge-graph-merge`
- **Labels:** P1
- **Depends on:** Implement runtime snapshot serializer and selector generator, Implement component handler extraction and data-doc parsing

## Intent
Knowledge graph: merge static and runtime facts, resolve entities and relationships.

## User Journey
1. Scan completes
2. Unified graph links pages, elements, features, flows

## Problem
Isolated scanner outputs need merging with conflict detection.

## Solution
packages/core graph operations: addFact, link, detectConflicts per SPEC_FULL.

## Runtime
| Axis | This slice |
|------|------------|
| Local | yes |

## Edge Cases
- Conflicting descriptions create conflict records
- Same element from two sources merged

## Acceptance
- [ ] Graph stores entities and relationships
- [ ] Merge prefers higher evidence tier
- [ ] Conflicts surfaced to review queue

## Design
Epic: `.qa/design/autoguide-platform.md`

---

### 15. Implement confidence scoring engine

- **Priority:** P0
- **Feature slug:** `confidence-engine`
- **Labels:** P0
- **Depends on:** Merge source and runtime facts into knowledge graph

## Intent
Score facts 0-1 based on evidence hierarchy from SPEC_FULL.

## User Journey
1. Facts scored after merge
2. Low confidence items flagged for review

## Problem
Users must see uncertainty, not hidden guesses.

## Solution
packages/core confidence module with weights, thresholds, destructive action rules.

## Runtime
| Axis | This slice |
|------|------------|
| Local | yes |

## Edge Cases
- Below 0.50 hidden from published mode
- Destructive actions require higher threshold

## Acceptance
- [ ] Scoring matches evidence hierarchy order
- [ ] confidence.json written
- [ ] Unit tests for score examples from spec

## Design
Epic: `.qa/design/autoguide-platform.md`

---

### 16. Implement review queue and manual override persistence

- **Priority:** P0
- **Feature slug:** `review-manual-override`
- **Labels:** P0
- **Depends on:** Implement confidence scoring engine

## Intent
Review workflow: queue uncertain facts, accept/edit/reject, persist manual overrides.

## User Journey
1. Dev opens review UI/CLI
2. Edits description
3. Override persisted and cannot be overwritten by AI

## Problem
Developer-reviewed truth must outrank inference.

## Solution
Review items, manual_override storage, verification rerun hook.

## Runtime
| Axis | This slice |
|------|------------|
| Local | yes |

## Edge Cases
- AI cannot overwrite manual_override
- Edited facts re-verified against evidence

## Acceptance
- [ ] Review queue populated for confidence < threshold
- [ ] Manual edit persists across rescans
- [ ] ai_proposal never overwrites approved facts

## Design
Epic: `.qa/design/autoguide-platform.md`

---

### 17. Implement development and published visibility modes

- **Priority:** P0
- **Feature slug:** `visibility-modes`
- **Labels:** P0
- **Depends on:** Implement review queue and manual override persistence, Create React adapter provider and widget placeholder

## Intent
Config mode development|published gates what SDK surfaces show.

## User Journey
1. Dev uses development mode during review
2. After publish, end users see only approved facts >= 0.85

## Problem
Only dev may see wrong content; end users need safe gate.

## Solution
Filter layer in SDK + config mode; published requires review_status approved.

## Runtime
| Axis | This slice |
|------|------------|
| Local | yes |

## Edge Cases
- Mode mismatch logged in dev
- Widget shows German empty state when nothing approved

## Acceptance
- [ ] development shows all facts with badges
- [ ] published hides unapproved and low confidence
- [ ] Config mode switch documented

## Design
Epic: `.qa/design/autoguide-platform.md`

---

### 18. Implement Playwright trace import from existing tests

- **Priority:** P1
- **Feature slug:** `playwright-import`
- **Labels:** P1
- **Depends on:** Implement JSON storage writer and SQLite index skeleton, Implement CLI init and doctor commands

## Intent
Import existing Playwright test traces (browo-hr e2e) as behavior evidence.

## User Journey
1. Dev runs scan --playwright-import ./e2e
2. Flow steps extracted from traces

## Problem
Reinventing crawl ignores existing test investment.

## Solution
Playwright trace/report parser plugin; map steps to flow candidates.

## Runtime
| Axis | This slice |
|------|------------|
| Local | yes |

## Edge Cases
- Auth sessions from tests reused where safe
- Import fails gracefully if no tests

## Acceptance
- [ ] Imports browo-hr e2e trace format
- [ ] Creates flow candidates with Playwright provenance
- [ ] Does not replace Playwright as test runner

## Design
Epic: `.qa/design/autoguide-platform.md`

---

### 19. Implement AutoGuide crawl fallback for uncovered routes

- **Priority:** P1
- **Feature slug:** `playwright-crawl-fallback`
- **Labels:** P1
- **Depends on:** Implement Playwright trace import from existing tests

## Intent
Own Playwright crawl for routes without test coverage.

## User Journey
1. Scan identifies uncovered routes
2. Crawl visits and captures traces/screenshots

## Problem
Not all routes have e2e tests.

## Solution
Crawl profile in CLI, safeMode default, screenshot optional.

## Runtime
| Axis | This slice |
|------|------------|
| Local | yes |

## Edge Cases
- safeMode skips destructive buttons
- Screenshots disabled via config

## Acceptance
- [ ] Crawl runs against example app
- [ ] Uncovered routes detected vs import
- [ ] PII redaction hooks stubbed

## Design
Epic: `.qa/design/autoguide-platform.md`

---

### 20. Implement flow candidate generation from traces

- **Priority:** P1
- **Feature slug:** `flow-generation`
- **Labels:** P1
- **Depends on:** Implement Playwright trace import from existing tests, Implement AutoGuide crawl fallback for uncovered routes

## Intent
Generate step-by-step flow candidates from Playwright evidence.

## User Journey
1. Scan produces flows.json with ordered steps
2. Dev reviews flow accuracy

## Problem
Wow moment requires flows not button inventories.

## Solution
Flow builder from trace events, link steps to elements and pages.

## Runtime
| Axis | This slice |
|------|------------|
| Local | yes |

## Edge Cases
- Branching flows split into separate candidates
- Incomplete flows marked uncertain

## Acceptance
- [ ] flows.json has ordered steps
- [ ] Each step links to element/page evidence
- [ ] Example app yields at least 1 flow

## Design
Epic: `.qa/design/autoguide-platform.md`

---

### 21. Implement AI provider interface and Ollama adapter

- **Priority:** P1
- **Feature slug:** `ai-ollama-provider`
- **Labels:** P1
- **Depends on:** Define core types and fact model in @autoguide/core

## Intent
AIProvider interface + Ollama-compatible local implementation (default).

## User Journey
1. Dev runs scan with Ollama local
2. AI proposes descriptions marked ai_proposal

## Problem
Semantic enrichment needed for readable docs beyond labels.

## Solution
packages/core or packages/ai: AIProvider, Ollama adapter, prompt templates with evidence-only rule.

## Runtime
| Axis | This slice |
|------|------------|
| Local | yes |

## Edge Cases
- Ollama unavailable: scan continues without AI
- Structured JSON output validated

## Acceptance
- [ ] AIProvider interface per spec
- [ ] Ollama adapter works with localhost:11434
- [ ] Output marked ai_proposal with confidence cap

## Design
Epic: `.qa/design/autoguide-platform.md`

---

### 22. Implement OpenAI-compatible cloud provider with API key and URL

- **Priority:** P1
- **Feature slug:** `ai-cloud-provider`
- **Labels:** P1
- **Depends on:** Implement AI provider interface and Ollama adapter

## Intent
Cloud AI via user-supplied API key + endpoint URL; explicit PII warning.

## User Journey
1. Dev sets ai.provider openai-compatible + key + URL in config/env
2. Confirms warning before first cloud call

## Problem
Some users want cloud quality; must be opt-in.

## Solution
OpenAI-compatible adapter, env AUTOGuide_AI_API_KEY + AUTOGuide_AI_ENDPOINT, consent prompt.

## Runtime
| Axis | This slice |
|------|------------|
| Hybrid | opt-in cloud |

## Edge Cases
- No cloud call without key
- HR apps show German warning dialog

## Acceptance
- [ ] Cloud provider uses configurable endpoint URL
- [ ] Missing key fails with clear error
- [ ] Consent required before first cloud enrichment

## Design
Epic: `.qa/design/autoguide-platform.md`

---

### 23. Implement AI output validation and ai_proposal marking

- **Priority:** P1
- **Feature slug:** `ai-output-validation`
- **Labels:** P1
- **Depends on:** Implement OpenAI-compatible cloud provider with API key and URL, Implement review queue and manual override persistence

## Intent
Validate AI JSON output against schema; never overwrite verified facts.

## User Journey
1. AI proposes fact
2. Validated and queued for review
3. Dev approves before publish

## Problem
Unvalidated AI output erodes trust.

## Solution
Schema validation, uncertainty classification in prompt, merge rules.

## Runtime
| Axis | This slice |
|------|------------|
| Local | yes |

## Edge Cases
- Hallucinated routes rejected
- Split composite facts when partially verified

## Acceptance
- [ ] Invalid AI JSON rejected
- [ ] ai_proposal in review queue
- [ ] Verification example from spec (approve button) passes

## Design
Epic: `.qa/design/autoguide-platform.md`

---

### 24. Implement CLI scan command full pipeline

- **Priority:** P0
- **Feature slug:** `cli-scan-pipeline`
- **Labels:** P0
- **Depends on:** Merge source and runtime facts into knowledge graph, Implement confidence scoring engine, Implement CLI init and doctor commands

## Intent
Wire autoguide scan: source + runtime + optional Playwright + optional AI → .autoguide/

## User Journey
1. Dev runs npx autoguide scan
2. Full knowledge artifacts generated locally

## Problem
Individual scanners exist but no unified scan command.

## Solution
scan orchestrator in CLI with flags for import/crawl/ai skip.

## Runtime
| Axis | This slice |
|------|------------|
| Local | yes |

## Edge Cases
- --no-ai flag works
- Scan exit non-zero on validation failure

## Acceptance
- [ ] scan produces features, pages, flows, confidence JSON
- [ ] Works on example app without cloud
- [ ] Non-zero exit on schema failure

## Design
Epic: `.qa/design/autoguide-platform.md`

---

### 25. Implement CLI review command

- **Priority:** P1
- **Feature slug:** `cli-review`
- **Labels:** P1
- **Depends on:** Implement review queue and manual override persistence, Implement CLI init and doctor commands

## Intent
CLI review: list, accept, edit, reject review queue items.

## User Journey
1. Dev runs autoguide review
2. Steps through uncertain facts interactively or via flags

## Problem
Not all review happens in browser UI.

## Solution
review subcommand with TTY prompts or JSON patch mode.

## Runtime
| Axis | This slice |
|------|------------|
| Local | yes |

## Edge Cases
- Non-interactive CI mode for listing only

## Acceptance
- [ ] Lists pending review items
- [ ] Edit persists manual override
- [ ] Reject removes from publish candidates

## Design
Epic: `.qa/design/autoguide-platform.md`

---

### 26. Implement Markdown documentation export

- **Priority:** P1
- **Feature slug:** `export-markdown`
- **Labels:** P1
- **Depends on:** Implement development and published visibility modes, Implement CLI scan command full pipeline

## Intent
Export approved knowledge as Markdown with metadata footer.

## User Journey
1. Dev runs autoguide export --format md
2. Gets onboarding-ready docs per page/flow

## Problem
Wow moment needs shareable training material.

## Solution
Export generator: page docs, flow steps, role visibility, provenance footer for dev export.

## Runtime
| Axis | This slice |
|------|------------|
| Local | yes |

## Edge Cases
- Export respects published filter
- German headings

## Acceptance
- [ ] Markdown export for pages and flows
- [ ] Includes last verified timestamp
- [ ] published-only content when mode published

## Design
Epic: `.qa/design/autoguide-platform.md`

---

### 27. Implement Help Center with context resolution

- **Priority:** P1
- **Feature slug:** `help-center`
- **Labels:** P1
- **Depends on:** Implement development and published visibility modes, Create React adapter provider and widget placeholder

## Intent
Help widget shows page/feature docs for current route and role.

## User Journey
1. End user opens Help on /vacation page
2. Sees relevant flow and actions

## Problem
Generic help is useless; context matters.

## Solution
Context resolver from route + userRole prop, Help Center panel sections per spec.

## Runtime
| Axis | This slice |
|------|------------|
| Local | yes |

## Edge Cases
- Unknown route shows empty state
- Role filtering stub for later RBAC issue

## Acceptance
- [ ] Widget resolves current route context
- [ ] Shows page title, actions, flows
- [ ] German UI copy

## Design
Epic: `.qa/design/autoguide-platform.md`

---

### 28. Implement deterministic search index

- **Priority:** P1
- **Feature slug:** `search-index`
- **Labels:** P1
- **Depends on:** Implement Markdown documentation export, Implement Help Center with context resolution

## Intent
Local search over knowledge index; deterministic first, no AI required.

## User Journey
1. User types in Help search
2. Matching pages/flows ranked by title and keywords

## Problem
Users need to find docs quickly in large apps.

## Solution
SQLite FTS or in-memory index from storage layer; search API for widget.

## Runtime
| Axis | This slice |
|------|------------|
| Local | yes |

## Edge Cases
- Empty query shows recent/toc
- Privacy: no external search API

## Acceptance
- [ ] Search returns pages and flows
- [ ] Works offline
- [ ] Sub-100ms on typical HR app corpus

## Design
Epic: `.qa/design/autoguide-platform.md`

---

### 29. Implement CLI publish command

- **Priority:** P0
- **Feature slug:** `cli-publish`
- **Labels:** P0
- **Depends on:** Implement development and published visibility modes, Implement Help Center with context resolution

## Intent
autoguide publish switches project to published mode after validation gate.

## User Journey
1. Dev completes review
2. Runs autoguide publish
3. End users see approved content only

## Problem
Manual config edit is error-prone for go-live.

## Solution
publish command validates thresholds, updates config/marker, documents rollback.

## Runtime
| Axis | This slice |
|------|------------|
| Local | yes |

## Edge Cases
- Publish fails if destructive facts unreviewed
- publish logs summary

## Acceptance
- [ ] publish sets mode published
- [ ] Fails when unapproved high-impact facts remain
- [ ] German CLI messages

## Design
Epic: `.qa/design/autoguide-platform.md`

---

### 30. Implement guided tour model and step generation

- **Priority:** P2
- **Feature slug:** `guided-tours`
- **Labels:** P2
- **Depends on:** Implement flow candidate generation from traces, Implement Help Center with context resolution

## Intent
Tour model with steps anchored to elements; generate from verified flows.

## User Journey
1. User starts guided tour for Urlaub beantragen
2. Spotlight steps through UI

## Problem
Flows in JSON are not yet interactive tours.

## Solution
Tour/step schema, generator from flows, TourRunner component.

## Runtime
| Axis | This slice |
|------|------------|
| Local | yes |

## Edge Cases
- Skip tour if element missing
- Tours only in published mode

## Acceptance
- [ ] Tour model validates against schema
- [ ] At least 1 tour in example app
- [ ] Steps highlight correct elements

## Design
Epic: `.qa/design/autoguide-platform.md`

---

### 31. Implement recommendation engine

- **Priority:** P2
- **Feature slug:** `recommendation-engine`
- **Labels:** P2
- **Depends on:** Implement confidence scoring engine, Implement review queue and manual override persistence

## Intent
Suggest code improvements: missing labels, ambiguous handlers, missing data-doc.

## User Journey
1. After scan dev sees recommendations list
2. Optional fixes improve confidence

## Problem
Apps lack metadata that would make docs trustworthy.

## Solution
Recommendation rules from SPEC_FULL; output recommendations.json.

## Runtime
| Axis | This slice |
|------|------------|
| Local | yes |

## Edge Cases
- Recommendations never auto-apply
- Linked to specific files/lines

## Acceptance
- [ ] Missing label detection
- [ ] recommendations.json written
- [ ] CLI doctor surfaces top recommendations

## Design
Epic: `.qa/design/autoguide-platform.md`

---

### 32. Implement Vue adapter

- **Priority:** P2
- **Feature slug:** `adapter-vue`
- **Labels:** P2
- **Depends on:** Create React adapter provider and widget placeholder, Implement development and published visibility modes

## Intent
Vue 3 adapter with parity to React MVP API.

## User Journey
1. Vue dev installs @autoguide/vue
2. Same Provider/Widget/Inspector behavior

## Problem
Full spec requires Vue support.

## Solution
plugins/vue mirroring React adapter surface.

## Runtime
| Axis | This slice |
|------|------------|
| Local | yes |

## Edge Cases
- Composition API plugin install
- SSR deferred

## Acceptance
- [ ] Vue 3 example app works
- [ ] API parity documented vs React
- [ ] No core framework imports

## Design
Epic: `.qa/design/autoguide-platform.md`

---

### 33. Implement Angular adapter

- **Priority:** P2
- **Feature slug:** `adapter-angular`
- **Labels:** P2
- **Depends on:** Create React adapter provider and widget placeholder, Implement development and published visibility modes

## Intent
Angular adapter with parity to React MVP API.

## User Journey
1. Angular dev installs @autoguide/angular
2. Module/standalone component integration

## Problem
Full spec requires Angular support.

## Solution
plugins/angular with NgModule or standalone bootstrap.

## Runtime
| Axis | This slice |
|------|------------|
| Local | yes |

## Edge Cases
- Zone.js change detection compatibility

## Acceptance
- [ ] Minimal Angular example runs widget
- [ ] API parity checklist completed

## Design
Epic: `.qa/design/autoguide-platform.md`

---

### 34. Implement Svelte adapter

- **Priority:** P2
- **Feature slug:** `adapter-svelte`
- **Labels:** P2
- **Depends on:** Create React adapter provider and widget placeholder, Implement development and published visibility modes

## Intent
Svelte adapter with parity to React MVP API.

## User Journey
1. Svelte dev installs @autoguide/svelte
2. Store-based context + widget

## Problem
Full spec requires Svelte support.

## Solution
plugins/svelte with Svelte 5 runes or stores per project standard.

## Runtime
| Axis | This slice |
|------|------------|
| Local | yes |

## Edge Cases
- SvelteKit route detection separate issue

## Acceptance
- [ ] Svelte example app runs widget
- [ ] API parity checklist completed

## Design
Epic: `.qa/design/autoguide-platform.md`

---

### 35. Implement Tauri adapter

- **Priority:** P2
- **Feature slug:** `adapter-tauri`
- **Labels:** P2
- **Depends on:** Create React adapter provider and widget placeholder, Implement development and published visibility modes

## Intent
Tauri 2 adapter for scriptony-multihost dogfood.

## User Journey
1. Tauri app embeds AutoGuide via webview bridge
2. Runtime scan works in desktop context

## Problem
scriptony is Tauri; browser-only SDK insufficient.

## Solution
plugins/tauri bridge for runtime scanner and widget in webview.

## Runtime
| Axis | This slice |
|------|------------|
| Tauri | yes |

## Edge Cases
- Webview DOM same as browser scanner
- File paths for .autoguide in app data dir

## Acceptance
- [ ] Works in scriptony-multihost dev build
- [ ] Documented install path
- [ ] No DOM APIs in core

## Design
Epic: `.qa/design/autoguide-platform.md`

---

### 36. Implement plugin API and registry

- **Priority:** P2
- **Feature slug:** `plugin-registry`
- **Labels:** P2
- **Depends on:** Define core types and fact model in @autoguide/core

## Intent
Plugin lifecycle and registry for scanners, adapters, AI providers.

## User Journey
1. Third party registers custom scanner plugin
2. CLI scan loads plugins from config

## Problem
Extensibility required from day one per architecture decision.

## Solution
Plugin interface, registry in core, discovery from autoguide.config plugins array.

## Runtime
| Axis | This slice |
|------|------------|
| Local | yes |

## Edge Cases
- Invalid plugin fails doctor check
- Version compatibility field

## Acceptance
- [ ] Plugin interface documented
- [ ] Built-in plugins register via same API
- [ ] Sample stub plugin in examples/

## Design
Epic: `.qa/design/autoguide-platform.md`

---

### 37. Implement HTML and PDF export

- **Priority:** P2
- **Feature slug:** `export-html-pdf`
- **Labels:** P2
- **Depends on:** Implement Markdown documentation export

## Intent
HTML and PDF export for onboarding packets.

## User Journey
1. Dev runs autoguide export --format pdf
2. Shares PDF with employees

## Problem
Markdown alone insufficient for some HR onboarding.

## Solution
HTML template render + PDF generator (playwright pdf or similar).

## Runtime
| Axis | This slice |
|------|------------|
| Local | yes |

## Edge Cases
- Large docs paginated
- Fonts embedded for German umlauts

## Acceptance
- [ ] HTML export matches Markdown content
- [ ] PDF generates for example app
- [ ] published filter respected

## Design
Epic: `.qa/design/autoguide-platform.md`

---

### 38. Implement role-based documentation filtering

- **Priority:** P2
- **Feature slug:** `role-based-docs`
- **Labels:** P2
- **Depends on:** Implement review queue and manual override persistence, Implement Help Center with context resolution

## Intent
Filter docs by userRole prop and fact role metadata.

## User Journey
1. HR admin sees admin flows
2. Employee sees employee-only flows

## Problem
browo-hr has multiple roles; docs must differ.

## Solution
Role tags on facts, filter in Help Center and export.

## Runtime
| Axis | This slice |
|------|------------|
| Local | yes |

## Edge Cases
- Missing role shows intersection or safe default

## Acceptance
- [ ] userRole prop filters content
- [ ] Export can target single role
- [ ] browo-hr role example documented

## Design
Epic: `.qa/design/autoguide-platform.md`

---

### 39. Implement version-aware change history

- **Priority:** P2
- **Feature slug:** `version-history`
- **Labels:** P2
- **Depends on:** Implement development and published visibility modes, Implement JSON storage writer and SQLite index skeleton

## Intent
Track doc staleness across git scans; mark changed artifacts stale.

## User Journey
1. Code changes after publish
2. Scan marks affected docs stale

## Problem
Docs drift from code without visibility.

## Solution
Git diff + AST diff hooks; stale markers in knowledge files.

## Runtime
| Axis | This slice |
|------|------------|
| Local | yes |

## Edge Cases
- Backend-only change flagged uncertain
- Version field per fact

## Acceptance
- [ ] Rescan detects changed routes/components
- [ ] Stale facts flagged in review
- [ ] History log in .autoguide/

## Design
Epic: `.qa/design/autoguide-platform.md`

---

### 40. Implement CI documentation validation command

- **Priority:** P2
- **Feature slug:** `ci-validate-docs`
- **Labels:** P2
- **Depends on:** Implement CLI scan command full pipeline, Define JSON schemas for knowledge artifacts

## Intent
CI command fails build when docs invalid or stale beyond threshold.

## User Journey
1. GitHub Action runs autoguide validate
2. PR fails if schemas break or stale high-impact docs

## Problem
Teams need enforcement in pipeline.

## Solution
validate subcommand, GitHub Action example in docs.

## Runtime
| Axis | This slice |
|------|------------|
| Local | yes |

## Edge Cases
- validate --soft for warnings only

## Acceptance
- [ ] validate exits non-zero on schema failure
- [ ] Example workflow in .github/workflows/
- [ ] Documented for browo-hr integration

## Design
Epic: `.qa/design/autoguide-platform.md`

---

### 41. Validate browo-hr integration with three complete flows

- **Priority:** P0
- **Feature slug:** `dogfood-browo-hr`
- **Labels:** P0
- **Depends on:** Implement Markdown documentation export, Implement CLI publish command, Implement CLI scan command full pipeline

## Intent
End-to-end proof: browo-hr with 3 step-by-step flows documented and publishable.

## User Journey
1. Run scan on browo-hr with Playwright import
2. Review 3 flows
3. Export Markdown/PDF and publish

## Problem
Wow moment unproven without real HR app validation.

## Solution
Integration doc, scan config for browo-hr, acceptance flows: Urlaubsantrag, Mitarbeiter anlegen, Genehmigung (or dev confirms alternatives).

## Runtime
| Axis | This slice |
|------|------------|
| Local | yes |

## Edge Cases
- Auth via existing e2e setup
- HR data stays local

## Acceptance
- [ ] 3 flows with ordered steps in flows.json
- [ ] Markdown export readable in German
- [ ] published mode hides unreviewed facts
- [ ] Playwright import from browo-hr/e2e used

## Design
Epic: `.qa/design/autoguide-platform.md`

---

### 42. Implement Flutter adapter

- **Priority:** P2
- **Feature slug:** `adapter-flutter`
- **Labels:** P2
- **Depends on:** Define core types and fact model in @autoguide/core

## Intent
Flutter adapter per SPEC_FULL future goals.

## User Journey
1. Flutter app integrates autoguide package
2. Widget overlay on Material/Cupertino app

## Problem
Full spec (c) includes Flutter.

## Solution
plugins/flutter Dart package bridging to core via platform channel or FFI stub.

## Runtime
| Axis | This slice |
|------|------------|
| Tauri | skip |
| Flutter | yes |

## Edge Cases
- MVP API parity definition documented
- May stub scanner for v1

## Acceptance
- [ ] Flutter example documents integration path
- [ ] Widget renders in example app
- [ ] Architecture doc for core bridge

## Design
Epic: `.qa/design/autoguide-platform.md`

---
