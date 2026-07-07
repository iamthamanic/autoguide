# Feature: Implement HTML and PDF export

<!-- seeded by ecc-runner from issue #37 on 2026-07-07 — @implement may refine -->

## Intent
HTML and PDF export for onboarding packets.

## Happy Path
- [x] HTML export matches Markdown content
- [x] PDF generates for example app
- [x] published filter respected

## Edge Cases
- [x] German umlauts preserved in HTML/PDF (äöü)
- [x] PDF skipped gracefully when Playwright Chromium unavailable

## Regression
- [x] Feed and topic routes still load

## Assumptions
- PDF rendering uses Playwright print from shared HTML export

## Screenshots
| Step | Filename |
|------|----------|
| 1 | `01-happy-path.png` |

## Implementation Notes
- `@autoguide/export`: `exportKnowledgeHtml`, `exportKnowledgePdf` (Playwright optional)
- CLI: `autoguide export --format html|pdf`
- CI: Chromium install via `@autoguide/export` filter
