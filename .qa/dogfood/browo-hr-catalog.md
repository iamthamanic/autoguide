# AutoGuide Dogfood Catalog — browo-hr

**Host app:** `../browo-hr/browo-hr` (React + Vite frontend on port 3006)  
**AutoGuide version:** `@iamthamanic/autoguide-*@0.1.2` (+ local CLI for schema-path workaround)  
**Phase A:** Deterministic only — no Ollama, no cloud API key, no Presidio  
**Phase B:** AI enrichment — deferred (cases D2–D5 marked pending)

---

## Goal

Prove that a developer can integrate AutoGuide into a real HR React app and produce contextual help that an end-user can use — without treating unverified/AI content as trusted truth in `published` mode.

## Non-goals (Phase A)

- No Ollama / cloud AI enrichment
- No Presidio or production PII pipeline hardening
- No scriptony / Tauri / multi-framework adapters
- No publishing npm from this run
- No full rewrite of browo-hr; minimal host changes only
- Not a substitute for browo’s own QA / E2E suite

---

## Personas

| Persona | Role in dogfood |
|---------|-----------------|
| **Dev integrator** | Installs packages, Vite plugin, `init`/`scan`/`generate`/`sync`, mounts `<AutoGuide />` |
| **HR admin** | Uses help dock for process guidance (e.g. leave requests, employee records) |
| **Employee** | Sees only `published` help — approved + high confidence; no review metadata overload |

---

## Success vs failure

| Success | Failure |
|---------|---------|
| Scan yields pages/facts/flows without crash | Empty `.autoguide/` or invalid JSON |
| Dock: help / tour / inspect / review usable | Widget missing, broken, or blocks host UI |
| ≥1 real user flow documented in DE | Only generic labels / garbage facts |
| `published`: only approved + confidence ≥ 0.85 | Unreviewed AI/content shown as truth |
| Secrets/PII not raw in exports (best-effort Phase A) | Cleartext secrets in `.autoguide/` |
| Dev understands review/inspect in &lt;5 min | Unclear what to do next |

**Stop conditions:** Widget makes app unusable; scan hangs/crashes; help labels critical actions wrongly; any cloud call without consent.

---

## Setup (Phase A)

1. Prefer npm: `@iamthamanic/autoguide-react`, `@iamthamanic/autoguide-vite`, `@iamthamanic/autoguide-cli@0.1.2`
2. Fallback: workspace / local monorepo CLI (required for scan — see A3)
3. `ai.provider: "none"` (or `scan --no-ai`)
4. Mount `<AutoGuide mode="development">` for dogfood; toggle `published` for B7
5. Frontend: `VITE_AUTOGUIDE_ENABLED=true`, Vite port **3006**, API proxy → **3011**

---

## Test cases

### A — Integration (Dev)

| ID | Case | Pass when |
|----|------|-----------|
| A1 | Packages install / Vite plugin | Dev server starts; no import errors |
| A2 | `autoguide init` | `autoguide.config.json` sensible (`appId`, `mode`, `ai.provider: none`) |
| A3 | `scan` (source only, `--no-ai`) | `facts.json` / `pages.json` schema-ok, &gt;0 pages |
| A4 | `scan --runtime` | Runtime facts if app reachable; else document BLOCKED |
| A5 | Artifacts at `/autoguide` | Widget loads JSON (not HTML 404 as JSON) |
| A6 | Host app still usable | Login/navigation not broken by AutoGuide |

### B — Runtime UI (User/Dev)

| ID | Case | Pass when |
|----|------|-----------|
| B1 | Dock visible | Bottom center/right; does not block primary actions |
| B2 | Open help | Route/element context or clear DE empty state |
| B3 | Tour | Starts/skips cleanly or honest “keine Tour” |
| B4 | Dev Inspect | Element selectable; inspector useful |
| B5 | Review panel | Pending visible; approve/reject understandable |
| B6 | Dev-Scan (0.1.2) | Running/done/error feedback; help reloads |
| B7 | `published` mode | Only approved high-confidence; less metadata |

### C — Content / docs

| ID | Case | Pass when |
|----|------|-----------|
| C1 | Real HR flow (e.g. Urlaub / Personalakte) | Steps ordered, DE readable |
| C2 | Export md/html | Usable for onboarding, not raw dump only |
| C3 | Confidence/provenance (dev) | Uncertainty visible in development |
| C4 | Rescan after change | Stale/new facts understandable |

### D — Security / AI (Phase B — pending)

| ID | Case | Pass when | Phase A status |
|----|------|-----------|----------------|
| D1 | Scan without AI | Usable with `--no-ai` / `provider: none` | Run in Phase A |
| D2 | Ollama enrich | AI proposals low confidence, need review | **PENDING Phase B** |
| D3 | Cloud key + consent | No upload without consent; key in env only | **PENDING Phase B** |
| D4 | Redaction | No clear secrets/mails in AI payload / export | **PENDING Phase B** |
| D5 | Presidio gap | Document which PII regex misses | **PENDING Phase B** |

---

## Scoring rubric (1–5)

| Score | Meaning |
|-------|---------|
| 5 | Works as documented; minor polish only |
| 4 | Usable; small gaps, clear workarounds |
| 3 | Partially works; important gaps for production dogfood |
| 2 | Major blockers; only fragments usable |
| 1 | Broken / unusable for stated goal |

Score each area (A/B/C/D1) then overall Phase A = weighted judgment (integration + runtime + content).

---

## Results / protocol

*Filled during the Phase A run. Status: PASS | FAIL | BLOCKED | PENDING*

| ID | Status | Observations | Evidence / notes |
|----|--------|--------------|------------------|
| A1 | **PASS** | npm `@iamthamanic/autoguide-react/vite/cli@0.1.2` install OK; Vite starts with plugin when `VITE_AUTOGUIDE_ENABLED=true` | `http://127.0.0.1:3006/` ready; no import errors |
| A2 | **PASS** | Config: `appId=browo-hr`, `mode=development`, `ai.provider=none`, `baseUrl=http://localhost:3006` | `frontend/autoguide.config.json` |
| A3 | **PASS** (workaround) | Source scan → **79 pages**, **561 facts**, **263 features**. Published npm CLI **crashes** on schema path (`@iamthamanic/core/schemas`). Local monorepo CLI works after fix. | Local CLI: `packages/cli` on `issue/dogfood-cli-schema-path` |
| A4 | **BLOCKED** | Docker daemon not running → no DB/backend → runtime scan against authenticated app not feasible. Frontend-only login page available. | `Cannot connect to the Docker daemon` |
| A5 | **PASS** (caveat) | Core artifacts (`facts`/`pages`/`doc-bundle`) served as JSON. Files copied by Vite plugin *after* server start can 200 as **HTML** (SPA) until restart — client then silently loads `reviews=[]`. | After Vite restart, `reviews.json` → `application/json` |
| A6 | **PASS** (partial) | Login page usable with dock; full app login **blocked** (no backend). Dock slightly overlaps Anmelden CTA. | Screenshot: dock bottom-center on `/login` |
| B1 | **PASS** | Dock visible bottom-center; DE labels (`Hilfe`, `AutoGuide`) | Browser dogfood 2026-07-17 |
| B2 | **PASS** | Help opens: `Hilfe: /login` + DE empty state *„Keine Dokumentation für diese Seite.“* + CLI hint | Dialog `aria-label=AutoGuide Hilfe` |
| B3 | **PASS** (honest empty) | No Tour button when `tours.json=[]` (feature gated on primary tour) — correct non-presence | `showTours = features.tours && primaryTour` |
| B4 | **FAIL** | Inspect activates full-screen crosshair overlay, but `onClickCapture` uses `event.target` (= overlay), so elements underneath cannot be selected | `InspectorOverlay.tsx` bug |
| B5 | **PASS** (after restart) | Review shows **97 offene Einträge**, Annehmen/Ablehnen, confidence %. First load showed 0 due to A5 HTML fallback | After restart: Review (97) |
| B6 | **FAIL** | `POST /__autoguide/scan` returns schema ENOENT from npm CLI 0.1.2 | `{"ok":false,"error":"ENOENT: ... @iamthamanic/core/schemas"}` |
| B7 | **PASS** (logic) | All 561 facts `needs_review`, 0 approved ≥0.85 → published would show no trusted help (correct gate). Not remounted live; verified on artifact counts. | `{approved:0, needs_review:561}` |
| C1 | **FAIL** | `flows.json=[]`, `tours.json=[]`. Source facts are handler names (`handleSubmit`, `onClick`), not HR-user flows in DE. Pages include team/employee routes but no readable flow steps. | Source-only Phase A |
| C2 | **FAIL** | MD export is page stubs with *„Keine freigegebenen Aktionen.“* — not onboarding-usable | `tmp/.../knowledge.md` |
| C3 | **PASS** | Review UI shows Confidence 74% + reason; provenance present on facts (`source_code` + filePath) | Review panel + `facts.json` |
| C4 | **PASS** (weak) | Rescan completes; fact file hash changes; `staleFactIds=[]` with no code edit — stale story unclear without intentional delta | CLI rescan same codebase |
| D1 | **PASS** | `ai.provider=none` + `scan --no-ai` — no AI calls | Config + scan |
| D2 | PENDING | Phase B — do not run Ollama/cloud now | |
| D3 | PENDING | Phase B | |
| D4 | PENDING | Phase B | |
| D5 | PENDING | Phase B | |

### Run metadata

| Field | Value |
|-------|-------|
| Date | 2026-07-17 |
| Autoguide commit / npm | npm `0.1.2`; CLI fix + dogfood docs on `issue/dogfood-cli-schema-path` @ `bce28ab` |
| browo-hr branch / commit | `feature/autoguide-dogfood-phase-a` @ `587e0a2e` |
| Frontend URL | http://127.0.0.1:3006/login |
| Backend | **BLOCKED** — Docker not running; port 3011 down |
| Login blocker | `/api/auth/me` ECONNREFUSED; authenticated HR flows not exercised |
| Overall Phase A score | **3 / 5** |

---

## Follow-up

See `.qa/dogfood/browo-hr-phase-a-report.md` after the run.
