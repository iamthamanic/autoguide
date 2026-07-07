/**
 * @autoguide/export — HTML documentation export.
 */

import type { Fact } from '@autoguide/core';
import { filterFactsForMode, filterByRole, filterFactsByRole } from '@autoguide/core';
import type { FlowRecord, PageRecord } from '@autoguide/core';
import type { ExportRenderOptions } from './types.js';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function exportPageHtml(page: PageRecord, facts: Fact[], options: ExportRenderOptions): string {
  const visible = filterFactsByRole(filterFactsForMode(facts, options.mode), options.userRole);
  const pageFacts = visible.filter((fact) => page.factIds.includes(fact.id));
  const actions =
    pageFacts.length === 0
      ? '<p><em>Keine freigegebenen Aktionen.</em></p>'
      : `<ul>${pageFacts
          .map(
            (fact) =>
              `<li><strong>${escapeHtml(fact.key)}:</strong> ${escapeHtml(String(fact.value ?? ''))}</li>`,
          )
          .join('')}</ul>`;

  return `
<section class="page">
  <h1>${escapeHtml(page.title)}</h1>
  <p><strong>Route:</strong> <code>${escapeHtml(page.route)}</code></p>
  <h2>Aktionen</h2>
  ${actions}
  <hr />
  <p class="meta">Exportiert: ${escapeHtml(options.exportedAt ?? new Date().toISOString())}</p>
</section>`;
}

function exportFlowHtml(flow: FlowRecord, options: ExportRenderOptions): string {
  const steps = flow.steps
    .map(
      (step) =>
        `<li><strong>${step.order}.</strong> ${escapeHtml(step.title)}${
          step.description ? `<br /><span>${escapeHtml(step.description)}</span>` : ''
        }</li>`,
    )
    .join('');

  return `
<section class="flow">
  <h1>Ablauf: ${escapeHtml(flow.title)}</h1>
  ${flow.description ? `<p>${escapeHtml(flow.description)}</p>` : ''}
  <h2>Schritte</h2>
  <ol>${steps}</ol>
  <hr />
  <p class="meta">Exportiert: ${escapeHtml(options.exportedAt ?? new Date().toISOString())}</p>
</section>`;
}

const HTML_STYLES = `
  body { font-family: system-ui, -apple-system, 'Segoe UI', sans-serif; line-height: 1.5; color: #0f172a; margin: 2rem; }
  h1 { font-size: 1.5rem; margin-bottom: 0.5rem; }
  h2 { font-size: 1.1rem; margin-top: 1.25rem; }
  code { background: #f1f5f9; padding: 0.1rem 0.35rem; border-radius: 4px; }
  .meta { color: #64748b; font-size: 0.85rem; }
  section { margin-bottom: 2rem; page-break-inside: avoid; }
`;

export function exportKnowledgeHtml(
  pages: PageRecord[],
  flows: FlowRecord[],
  facts: Fact[],
  options: ExportRenderOptions,
): string {
  const rolePages = filterByRole(pages, options.userRole);
  const roleFlows = filterByRole(flows, options.userRole);
  const roleLabel = options.userRole ? ` (${escapeHtml(options.userRole)})` : '';
  const body = [
    `<h1>AutoGuide Dokumentation${roleLabel}</h1>`,
    ...rolePages.map((page) => exportPageHtml(page, facts, options)),
    ...roleFlows.map((flow) => exportFlowHtml(flow, options)),
  ].join('\n');

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>AutoGuide Dokumentation</title>
  <style>${HTML_STYLES}</style>
</head>
<body>
${body}
</body>
</html>`;
}
