# AutoGuide × browo-hr — Phase A Report

**Date:** 2026-07-17  
**Scope:** Deterministic dogfood only (no Ollama, no cloud AI, no Presidio)  
**Host:** `browo-hr/browo-hr/frontend` (React + Vite :3006)  
**Packages:** `@iamthamanic/autoguide-{react,vite,cli}@0.1.2`  
**Catalog:** [.qa/dogfood/browo-hr-catalog.md](./browo-hr-catalog.md)

---

## Verdict

Phase A **partially succeeds**: a real host app can mount the dock, run a source scan, and open Help/Review in German. It does **not** yet deliver end-user-ready HR documentation (empty flows/tours; source facts are handler identifiers). Published npm CLI **0.1.2** cannot scan without a local CLI workaround.

**Overall Phase A score: 3 / 5**

| Area | Score | Notes |
|------|-------|-------|
| A Integration | 3.5 | npm install + Vite mount OK; CLI scan broken on npm; runtime scan blocked |
| B Runtime UI | 3 | Dock/Help/Review work; Inspect broken; Dev-Scan broken on npm CLI |
| C Content | 2 | Pages yes; flows/tours/export not useful for HR onboarding |
| D1 No-AI | 5 | `provider: none` / `--no-ai` clean |

---

## What worked

1. **Drop-in React mount** behind `VITE_AUTOGUIDE_ENABLED` with feature-flagged shell (`HrKo_AutoGuideShell` / `Inner`).
2. **Source scan** (local CLI): 79 pages, 561 facts, 263 features, 97 review-queue items.
3. **Dock UX (DE):** Hilfe empty-state for `/login`; Entwickler-Menü with Scan / Inspect / Review.
4. **Review panel** after Vite restart: 97 pending items with confidence % and Annehmen/Ablehnen.
5. **Published gate (artifact-level):** 0 approved facts → published mode would correctly show no trusted help.
6. **Phase A AI off:** config `ai.provider: "none"` honored.

## What was blocked

| Blocker | Impact |
|---------|--------|
| Docker daemon not running | No Postgres/Redis → backend :3011 down → no login → no authenticated HR flows / weak A4 |
| npm CLI schema path | `scan` / Dev-Scan fail on published 0.1.2 without monorepo CLI |
| Vite public artifact timing | `reviews.json` served as HTML until restart → Review showed 0 until reload |

---

## Scorecard (summary)

| ID | Status |
|----|--------|
| A1–A3, A5–A6 | PASS (A3 via local CLI) |
| A4 | BLOCKED |
| B1–B3, B5, B7 | PASS |
| B4, B6 | FAIL |
| C3, C4 | PASS (weak) |
| C1, C2 | FAIL |
| D1 | PASS |
| D2–D5 | PENDING Phase B |

---

## Top 5 weaknesses (AutoGuide follow-ups)

1. **Published CLI schema resolution (P0)** — `json-schema-validator` resolves `../../../core/schemas` → missing `@iamthamanic/core/schemas` in npm layout. Fix: resolve via `@iamthamanic/autoguide-core` (started on `issue/dogfood-cli-schema-path`). Blocks scan + Dev-Scan for all npm consumers.

2. **Source facts are not user docs (P0)** — Values like `handleSubmit` / `onClick` with confidence 0.74 flood review queue; Help empty for real routes. Need better extraction (labels, DocElement, runtime/Playwright) before “wow” onboarding.

3. **Inspector overlay click target (P1)** — `InspectorOverlay` uses `event.target` (always the full-screen overlay). Should use `document.elementFromPoint` / `elementsFromPoint`.

4. **Silent empty optional artifacts (P1)** — Client treats non-JSON (SPA HTML) as `[]` for reviews/tours. Prefer hard fail or toast when `Content-Type` is wrong for expected files. Also: Vite plugin should ensure public copies are served (middleware or restart guidance).

5. **No flows/tours without runtime/Playwright (P1)** — Source-only Phase A leaves `flows.json`/`tours.json` empty; MD export useless for onboarding. Document requirement: runtime scan or Playwright import for C1/C2.

---

## Recommended follow-up issues (autoguide)

| Priority | Issue (suggested title) |
|----------|-------------------------|
| P0 | fix: resolve JSON schemas via `@iamthamanic/autoguide-core` in published CLI |
| P0 | feat: source scanner emits user-facing labels / filters noise handlers |
| P1 | fix: InspectorOverlay element picking via elementFromPoint |
| P1 | fix: client warns when artifact fetch returns HTML; vite plugin serves `.autoguide` in middleware |
| P1 | docs: INTEGRATION.md — Phase A needs runtime/Playwright for flows; restart after first sync |
| P2 | chore: bump patch `0.1.3` after CLI schema fix + republish |

---

## Host integration notes (browo-hr)

- Branch: `feature/autoguide-dogfood-phase-a`
- Packages: published npm (not file: workspace) for react/vite/cli
- Scripts: `autoguide:scan` prefers local monorepo CLI when present
- Mode: `development` + inspector/tours features enabled for dogfood
- Artifacts gitignored under `frontend/.autoguide/` and `frontend/public/autoguide/`

---

## Exact next step for Phase B (AI)

When ready:

1. Ship/publish **CLI schema fix** (`0.1.3`) so npm scan/Dev-Scan work.
2. Start browo with Docker (`npm run db:setup` + backend) and log in as HR admin.
3. Set `ai.provider` to `ollama` (local) **or** `openai-compatible` with env key + explicit consent — never both accidentally.
4. Run `autoguide scan` **without** `--no-ai`; confirm proposals land as `ai_proposal` / low confidence and appear in Review — not in `published` Help.
5. Execute catalog **D2–D5** (redaction sample with fake PII in a fixture page; document Presidio gaps).
6. Re-score content C1–C2 after AI + one Playwright leave-request flow import.
