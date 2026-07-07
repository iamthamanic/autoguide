/**
 * @autoguide/export — Markdown documentation export.
 */

import { filterFactsForMode } from '@autoguide/core';
import type { FlowRecord, PageRecord } from '@autoguide/core';
import type { ExportRenderOptions } from './types.js';

export type MarkdownExportOptions = ExportRenderOptions;

export function exportPageMarkdown(
  page: PageRecord,
  facts: import('@autoguide/core').Fact[],
  options: MarkdownExportOptions,
): string {
  const visible = filterFactsForMode(facts, options.mode);
  const pageFacts = visible.filter((fact) => page.factIds.includes(fact.id));
  const lines = [
    `# ${page.title}`,
    '',
    `**Route:** \`${page.route}\``,
    '',
    '## Aktionen',
    '',
  ];
  if (pageFacts.length === 0) {
    lines.push('_Keine freigegebenen Aktionen._', '');
  } else {
    for (const fact of pageFacts) {
      lines.push(`- **${fact.key}:** ${String(fact.value ?? '')}`);
    }
    lines.push('');
  }
  lines.push('---', `_Exportiert: ${options.exportedAt ?? new Date().toISOString()}_`);
  return lines.join('\n');
}

export function exportFlowMarkdown(
  flow: FlowRecord,
  options: MarkdownExportOptions,
): string {
  const lines = [
    `# Ablauf: ${flow.title}`,
    '',
    flow.description ? `${flow.description}\n` : '',
    '## Schritte',
    '',
  ];
  for (const step of flow.steps) {
    lines.push(`${step.order}. ${step.title}`);
    if (step.description) lines.push(`   ${step.description}`);
  }
  lines.push('', '---', `_Exportiert: ${options.exportedAt ?? new Date().toISOString()}_`);
  return lines.join('\n');
}

export function exportKnowledgeMarkdown(
  pages: PageRecord[],
  flows: FlowRecord[],
  facts: import('@autoguide/core').Fact[],
  options: MarkdownExportOptions,
): string {
  const chunks = [
    '# AutoGuide Dokumentation',
    '',
    ...pages.map((page) => exportPageMarkdown(page, facts, options)),
    ...flows.map((flow) => exportFlowMarkdown(flow, options)),
  ];
  return chunks.join('\n\n');
}
