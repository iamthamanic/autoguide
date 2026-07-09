# Clean Test Basis — Engine-Vertrauen vor Ausbau

<!-- Scope für: reproduzierbare Scan-Artefakte, Integrationstests, browo-hr dogfood -->

**Ziel:** Nicht weiter bauen, sondern auf einer Basis testen, der wir vertrauen.  
**Nicht-Ziel:** Adapter-Parität, scan.ts-Modul-Split, VisuDEV, UI-Polish.

**Roadmap:** Engine hardening (Stufe A) — post #74–#109 stabilization.

---

## Erfolgskriterium (2–4 Wochen)

Nach `autoguide scan` (mit/ohne `--runtime`, mit/ohne Rescan) sind die Kern-Artefakte schema-valide und durch feste Integrationstests abgesichert. Gleiche Inputs → gleiche Fact-Merge-Semantik (keine stillen Doppel-Merges).

**Referenz-Szenarien (Pflicht grün):**

| Szenario | Test / Pfad |
|----------|-------------|
| Playwright + Flows + Export | `integrations/hr-workflows`, `hr-workflows.integration.test.ts` |
| Runtime DOM → facts + confidence | `runtime-scan.integration.test.ts` |
| Rescan → stale in facts + confidence | `version-history.test.ts` |
| Schema aller Scan-Artefakte | `json-schema-validator.test.ts` |

**Adapter:** React = Dogfood-Referenz; Vue/Angular/Svelte/Flutter/Tauri = **eingefroren** (CI-Smoke only, keine neuen Features).

---

## Issue 1 — `scan-merge-lean`

**Intent:** Ein Fact-Merge-Pfad pro Scan — keine drei `KnowledgeGraph`-Instanzen, kein doppeltes `buildEntityGraph`.

### Acceptance

- [ ] `runScan` verwendet **eine** `KnowledgeGraph`-Instanz für: initial merge, AI merge, plugin-transform re-merge
- [ ] `mergeConflicts` wird append-only aus denselben Merge-Schritten gesammelt (keine Duplikate durch Graph-Reset)
- [ ] `buildEntityGraph` wird **einmal** aufgerufen — nach `linkRecordsToGraph`
- [ ] `graph.json` enthält verlinkte `pageIds` / `featureIds` / `elementIds` konsistent mit `pages.json` / `features.json`
- [ ] Bestehende Tests grün: `version-history`, `hr-workflows`, `runtime-scan`, `plugins`, `recommendations`
- [ ] Kein Verhalten-Change bei `--noAi` und ohne Plugins (Regression)

### Out of scope

- `scan.ts` in Module splitten
- Plugin-API ändern

---

## Issue 2 — `runtime-dom-single-source`

**Intent:** `runtime_dom`-Facts aus CLI-Runtime-Scan und `@autoguide/runtime` nutzen dieselbe Selector/A11y-Logik — Drift unmöglich machen.

### Acceptance

- [ ] `browserScanDom` (Playwright `page.evaluate`) und `scanDom` (`@autoguide/runtime`) produzieren für gleiches Fixture-HTML **dieselben** `entityId` / accessible names (Snapshot- oder Unit-Test)
- [ ] Keine duplizierte `generateSelector` / `getAccessibleName` Logik in `browser-scan-dom.ts` (Bundle oder Build-Step aus runtime)
- [ ] `capture-runtime.integration.test.ts` bleibt grün (unreachable host)
- [ ] `runtime-scan.integration.test.ts`: `runtime_dom` in `facts.json` + `confidence.json.facts[*].evidenceFamilies`

### Out of scope

- Neuer Crawl-Algorithmus
- Inspector-Widget-Änderungen

---

## Issue 3 — `artifact-validation-contract`

**Intent:** Ein Validierungs-Gate vor Persist; Confidence/Conflict nicht doppelt modelliert.

### Acceptance

- [ ] Nur **ein** Validierungsweg vor `.autoguide/` Write: AJV (`validateArtifactsWithJsonSchema`) — tote `validateScanArtifacts`-Bulk-Guards entfernt oder nur `isFact`/`isProvenance` behalten
- [ ] Pre-write Validation nutzt **dieselbe** `confidence`-Shape wie Persist (`buildConfidenceArtifact`, nicht nur `{ scores }`)
- [ ] `buildConfidenceArtifact` projiziert `fact.conflict` wo vorhanden — kein Re-Inferieren des Gewinners in `conflictStatusFromMerge` wenn `fact.conflict` gesetzt
- [ ] `facts.schema.json` + `confidence.schema.json` validieren geschriebene Artefakte in `json-schema-validator.test.ts`
- [ ] YAGNI cleanup: `markAffectedFactsStale` entfernt (Logik nur in `mergeRescanFacts`); `KnowledgeGraph.addFact` entfernt; `flow-step.ts` in `score.ts` merged oder gelöscht wenn ungenutzt in Prod

### Out of scope

- `FactMergeGraph`-Rename (optional follow-up)
- Adapter freeze als Code-Änderung

---

## Empfohlene Merge-Reihenfolge

```
Issue 1 (scan-merge-lean)  →  Issue 3 (validation contract)  →  Issue 2 (runtime DOM)
```

**Begründung:** Issue 1 fixiert Merge-Korrektheit für alle Tests. Issue 3 aligniert Validation mit geschriebenen Artefakten (aktuell: Validation mit `{ scores }` only, Persist mit vollem Artifact — Drift-Risiko). Issue 2 schützt Runtime-Evidence, sobald Merge stabil ist.

---

## Freeze-Policy (Dokumentation only)

In `AGENTS.md` / README ergänzen:

- **Reference adapter:** React (`plugins/react`, `examples/react-vite`, browo-hr)
- **Smoke adapters:** Vue, Angular, Svelte — build in CI, no feature parity until explicit issue
- **Experiments:** Flutter, Tauri — no product commitment
