#!/usr/bin/env bash
# Create Phase 3 GitHub issues for AutoGuide documentation intelligence depth.
set -euo pipefail

REPO="${1:-iamthamanic/autoguide}"

create() {
  local title="$1"
  local labels="$2"
  local body="$3"
  gh issue create --repo "$REPO" --title "$title" --label "$labels" --body "$body"
}

echo "Creating Phase 3 issues on $REPO..."

create \
  "Replace regex-heavy source scanner with TypeScript AST extraction" \
  "P0,agent-ready" \
  "$(cat <<'EOF'
## Intent
Make source scanning deterministic and robust for real codebases.

## User Journey
1. Dev runs `autoguide scan`
2. Scanner parses TS/TSX via TypeScript AST (not regex)
3. JSX elements, handlers, routes, and `data-doc-*` are extracted with file/line provenance

## Problem
Current `packages/scanner` uses regex for routes, handlers, and data-doc attributes. This breaks on nested components, imports, and non-trivial JSX.

## Solution
- AST visitors for `JSXElement`, `JSXAttribute`, `CallExpression`, `ImportDeclaration`
- Link `onClick={handler}` to function declaration when resolvable in same file
- Keep regex only as fallback behind feature flag

## Acceptance
- [ ] Scanner detects button labels from JSX text/aria without regex
- [ ] Scanner links `onClick={approveVacationRequest}` to handler symbol
- [ ] Scanner extracts `data-doc-*` attributes via AST
- [ ] Tests cover nested components and imported handlers
- [ ] `pnpm run verify` passes

## Design
Epic: `.qa/design/autoguide-platform.md` — Phase 3: Semantics

**Feature slug:** `scanner-ast-v1`
EOF
)"

create \
  "Build real Knowledge Graph entity and relationship model" \
  "P0,agent-ready" \
  "$(cat <<'EOF'
## Intent
Replace fact-only merge with Page→Feature→Element→Flow entity graph.

## Problem
`KnowledgeGraph` today merges facts by `entityId:key` only. No queryable relationships.

## Solution
- Entity types: Page, Feature, Element, Handler, Flow
- Relationship edges: contains, uses, triggers, belongsToRole
- Graph query API: by route, role, feature id

## Depends on
- #43 (AST scanner feeds element/handler entities)

## Acceptance
- [ ] Page contains Features and Elements
- [ ] Element can link to Handler facts
- [ ] Graph queries by route and role
- [ ] Scan pipeline writes graph alongside facts.json
- [ ] Unit tests for merge and query

**Feature slug:** `knowledge-graph-entities`
EOF
)"

create \
  "Runtime snapshot v2 — forms, modals, route observer" \
  "P0,agent-ready" \
  "$(cat <<'EOF'
## Intent
Collect richer live UI state beyond static button querySelector.

## Scope
- Form fields and labels
- Dialog/modal detection (`role=dialog`, `[aria-modal]`)
- Disabled/loading states
- Visible text regions
- Route-change observer hook
- Optional MutationObserver for snapshot refresh

## Acceptance
- [ ] Snapshot includes forms and dialogs
- [ ] Snapshot updates after simulated route change in tests
- [ ] Inspector resolves selected element to runtime entity id
- [ ] No DOM APIs leak into `@autoguide/core`

**Feature slug:** `runtime-snapshot-v2`
EOF
)"

create \
  "Implement Review Verification Loop" \
  "P0,agent-ready" \
  "$(cat <<'EOF'
## Intent
Developer edits become durable verified or unsupported knowledge.

## Scope
- Review actions: pending, accepted, edited, rejected, verified_after_edit, unsupported_manual_knowledge, conflict
- Re-run verification after edit
- Persist manual overrides; prevent AI overwrite (extend existing guards)
- Unsupported manual knowledge → recommendation entry

## Acceptance
- [ ] AI proposal cannot overwrite manual review
- [ ] Edited fact persisted with review action history
- [ ] CLI `review` supports edit flow with verification rerun
- [ ] Tests for overwrite prevention and edit persistence

**Feature slug:** `review-verification-loop`
EOF
)"

create \
  "Playwright flow verification — prove guides against app behavior" \
  "P0,agent-ready" \
  "$(cat <<'EOF'
## Intent
Verify generated flow steps execute successfully in a real browser.

## Scope
- `FlowVerificationProfile` type
- Run flow steps via Playwright against baseUrl
- Capture expected vs actual route and visible state
- Mark flow verified | failed | partial; store trace/screenshot path on failure

## Depends on
- Knowledge graph entities (#44)
- Runtime snapshot v2 (#45) recommended

## Acceptance
- [ ] A flow verified in `examples/react-vite`
- [ ] Failed step stores artifact path in flow metadata
- [ ] Verified flows eligible for publish gate
- [ ] CLI flag: `autoguide scan --verify-flows` or subcommand

**Feature slug:** `playwright-flow-verify`
EOF
)"

create \
  "PII and secret redaction hooks before AI and export" \
  "P0,agent-ready" \
  "$(cat <<'EOF'
## Intent
Meet SPEC security acceptance: no secrets/PII in docs or cloud AI payloads.

## Scope
- Redaction utilities in `@autoguide/core` or `@autoguide/ai`
- Hook before AI enrichment and export
- Env var names, API keys, email patterns (configurable)
- Tests with sample HR-like strings

## Acceptance
- [ ] Redaction strips known secret patterns
- [ ] AI provider receives redacted evidence by default
- [ ] Export does not contain injected secrets from scan fixtures
- [ ] Documented in README env section

**Feature slug:** `pii-redaction`
EOF
)"

create \
  "Wire runtime scanner into CLI scan pipeline" \
  "P1,agent-ready" \
  "$(cat <<'EOF'
## Intent
CLI scan should merge runtime facts, not only source + Playwright.

## Scope
- Optional `--runtime-url` or use config baseUrl with Playwright page snapshot
- Merge runtime_dom facts into graph during scan
- Document when runtime scan runs (CI vs local dev)

## Acceptance
- [ ] `autoguide scan` can include runtime_dom provenance without manual inspector
- [ ] Runtime facts appear in `.autoguide/facts.json`
- [ ] Integration test with mock DOM or playwright page

**Feature slug:** `cli-runtime-scan`
EOF
)"

create \
  "Confidence engine v2 — multi-signal correlation and conflict resolution" \
  "P1,agent-ready" \
  "$(cat <<'EOF'
## Intent
Upgrade from single-source weight table to evidence correlation.

## Scope
- Correlate source_code + runtime_dom + playwright_trace for same entity
- Conflict resolution rules by evidence type
- Destructive action threshold per flow step
- Stale detection at feature level (extend history module)

## Acceptance
- [ ] Multi-provenance facts score higher than single source
- [ ] Conflicting values flagged with resolution policy
- [ ] Unit tests match SPEC evidence hierarchy examples

**Feature slug:** `confidence-engine-v2`
EOF
)"

create \
  "SQLite full-text search index for Help Widget" \
  "P1,agent-ready" \
  "$(cat <<'EOF'
## Intent
Deterministic search backed by SQLite index, not only in-memory filter.

## Scope
- Index pages, flows, facts on scan
- Query API in storage package
- Widget uses index when `.autoguide` available via loader hook (future); CLI search command optional

## Acceptance
- [ ] SQLite FTS or indexed columns populated on scan
- [ ] Search returns ranked results for German text
- [ ] Falls back to in-memory search when index missing

**Feature slug:** `search-index-sqlite`
EOF
)"

create \
  "In-app Review UI for developer workflow" \
  "P1,agent-ready" \
  "$(cat <<'EOF'
## Intent
Developers review uncertain facts in-app, not only via CLI.

## Scope
- Review panel in `@autoguide/react` (dev mode only)
- List pending facts, accept/edit/reject
- Persist via host callback or local `.autoguide` API stub
- German UI copy per styleguide

## Acceptance
- [ ] Dev mode shows review queue count badge
- [ ] Accept/reject updates fact reviewStatus in memory demo
- [ ] Published mode hides review UI
- [ ] Tests for review actions

**Feature slug:** `review-ui`
EOF
)"

create \
  "Persist guided tours from scan pipeline" \
  "P1,agent-ready" \
  "$(cat <<'EOF'
## Intent
Close guided tours v1 gap: tours.json written on scan, TourRunner consumes real data.

## Scope
- `generateToursFromFlows` invoked in scan command
- Write `tours.json` to `.autoguide/`
- Example app loads tours from scan output

## Acceptance
- [ ] Scan produces at least one tour for example app
- [ ] TourRunner highlights steps from persisted tours
- [ ] Schema validation passes

**Feature slug:** `guided-tours-persistence`
EOF
)"

create \
  "Committed JSON Schema files for knowledge artifacts" \
  "P1,agent-ready" \
  "$(cat <<'EOF'
## Intent
PRD acceptance: public JSON validates against schema (formal JSON Schema, not only TS guards).

## Scope
- `packages/core/schemas/*.schema.json` for facts, pages, flows, features, confidence
- Validate command uses schemas
- CI validates fixtures

## Acceptance
- [ ] Schema files committed and versioned
- [ ] `autoguide validate` uses JSON Schema
- [ ] hr-workflows fixture validates

**Feature slug:** `json-schema-artifacts`
EOF
)"

create \
  "Complete recommendation engine — doctor and recommendations.json" \
  "P2,agent-ready" \
  "$(cat <<'EOF'
## Intent
Surface actionable recommendations (missing labels, low confidence clusters).

## Scope
- Write `recommendations.json` on scan
- `autoguide doctor` lists top recommendations
- Link to review queue items

## Acceptance
- [ ] Missing aria/label detection creates recommendation
- [ ] doctor command surfaces recommendations
- [ ] Tests for recommendation engine output

**Feature slug:** `recommendation-engine-complete`
EOF
)"

create \
  "Plugin API full scan and transform lifecycle" \
  "P2,agent-ready" \
  "$(cat <<'EOF'
## Intent
Wire `AutoGuidePlugin` setup/scan/transform in CLI pipeline per SPEC.

## Scope
- Plugin discovery from config
- Isolated plugin failures (non-fatal)
- Version compatibility check
- Example stub plugin in examples/

## Acceptance
- [ ] Third-party plugin can contribute scan facts
- [ ] Plugin output validates against schema
- [ ] Registry documents capabilities

**Feature slug:** `plugin-api-lifecycle`
EOF
)"

create \
  "Extract packages/ui shared widget primitives" \
  "P2,agent-ready" \
  "$(cat <<'EOF'
## Intent
Share tokens, ReviewBadge, FlowStepList across React/Vue/Svelte adapters.

## Scope
- `packages/ui` with framework-agnostic tokens CSS + headless state types
- React adapter imports from ui package
- Document in SPEC monorepo layout

## Acceptance
- [ ] packages/ui builds standalone
- [ ] React widget uses shared tokens
- [ ] No React in packages/ui

**Feature slug:** `packages-ui`
EOF
)"

create \
  "CLI generate command for tours and documentation bundles" \
  "P2,agent-ready" \
  "$(cat <<'EOF'
## Intent
Add `autoguide generate` per SPEC (distinct from export format conversion).

## Scope
- Subcommands or flags: tours, recommendations, doc bundle
- Orchestrates core generators without re-scan

## Acceptance
- [ ] `autoguide generate tours` writes tours.json from existing flows
- [ ] Documented in README and AGENTS.md
- [ ] Tests for generate entrypoint

**Feature slug:** `cli-generate`
EOF
)"

create \
  "Public API documentation for @autoguide packages" \
  "P2,agent-ready" \
  "$(cat <<'EOF'
## Intent
SPEC engineering acceptance: public APIs documented.

## Scope
- `docs/api/` with generated or curated reference for core, cli, react
- TypeDoc or markdown from exports
- Link from README

## Acceptance
- [ ] docs/api/README.md index exists
- [ ] Core public exports documented
- [ ] CI does not break

**Feature slug:** `public-api-docs`
EOF
)"

create \
  "UI styleguide parity for Vue, Angular, and Svelte adapters" \
  "P2,agent-ready" \
  "$(cat <<'EOF'
## Intent
Port React styleguide work (tokens, states, a11y) to other framework adapters.

## Scope
- ReviewBadge, FlowStepList equivalents
- Loading/empty/error states
- ESC and focus patterns per framework

## Acceptance
- [ ] Vue widget passes parity checklist
- [ ] Svelte widget passes parity checklist
- [ ] Angular widget passes parity checklist

**Feature slug:** `adapter-ui-styleguide`
EOF
)"

create \
  "DocElement SDK component for host app annotations" \
  "P2,agent-ready" \
  "$(cat <<'EOF'
## Intent
Provide `DocElement` wrapper per SPEC instead of only data-doc-* attributes.

## Scope
- React DocElement component wrapping children with metadata
- Scanner recognizes DocElement usage via AST
- Example app migration

## Acceptance
- [ ] DocElement sets data-doc-* and registers with provider
- [ ] Scanner extracts DocElement props
- [ ] Example app uses DocElement on primary action

**Feature slug:** `doc-element`
EOF
)"

create \
  "Sync PRD, acceptance artifacts, and Phase 3 completion status" \
  "P2,agent-ready" \
  "$(cat <<'EOF'
## Intent
Documentation truth: PRD deferred list, acceptance checkboxes, AGENTS.md reflect actual state.

## Scope
- Update docs/PRD.md (deferred vs done)
- Mark completed acceptance files [x]
- Add Phase 3 roadmap section to .qa/design/

## Acceptance
- [ ] PRD MVP deferred items accurate
- [ ] hr-workflows-integration acceptance reflects green tests
- [ ] monorepo-foundation acceptance checked

**Feature slug:** `docs-phase3-sync`
EOF
)"

echo "Done creating Phase 3 issues."
