/**
 * @autoguide/cli — export command.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { readFile } from 'node:fs/promises';
import { loadConfigFromObject } from '@autoguide/config';
import type { AutoGuideConfigInput } from '@autoguide/config';
import {
  exportKnowledgeHtml,
  exportKnowledgeMarkdown,
  exportKnowledgePdf,
} from '@autoguide/export';
import { loadArtifacts, resolveOutputDir } from '../lib/artifacts.js';

export type ExportFormat = 'md' | 'html' | 'pdf';

export interface ExportOptions {
  format?: ExportFormat;
  outDir?: string;
}

export async function runExport(cwd: string, options: ExportOptions = {}): Promise<number> {
  const format = options.format ?? 'md';
  if (!['md', 'html', 'pdf'].includes(format)) {
    console.error(`Format nicht unterstützt: ${format}`);
    return 1;
  }

  const config = JSON.parse(
    await readFile(join(cwd, 'autoguide.config.json'), 'utf8'),
  ) as AutoGuideConfigInput;
  const resolved = loadConfigFromObject(config);
  const outputDir = await resolveOutputDir(cwd);
  const bundle = await loadArtifacts(outputDir);
  const renderOptions = { mode: resolved.mode };
  const targetDir = join(cwd, options.outDir ?? 'docs/autoguide-export');
  await mkdir(targetDir, { recursive: true });

  if (format === 'md') {
    const markdown = exportKnowledgeMarkdown(
      bundle.pages,
      bundle.flows,
      bundle.facts,
      renderOptions,
    );
    const filePath = join(targetDir, 'knowledge.md');
    await writeFile(filePath, `${markdown}\n`, 'utf8');
    console.log(`Export geschrieben: ${filePath}`);
    return 0;
  }

  if (format === 'html') {
    const html = exportKnowledgeHtml(bundle.pages, bundle.flows, bundle.facts, renderOptions);
    const filePath = join(targetDir, 'knowledge.html');
    await writeFile(filePath, html, 'utf8');
    console.log(`Export geschrieben: ${filePath}`);
    return 0;
  }

  const pdfPath = join(targetDir, 'knowledge.pdf');
  try {
    await exportKnowledgePdf(
      bundle.pages,
      bundle.flows,
      bundle.facts,
      pdfPath,
      renderOptions,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`PDF-Export fehlgeschlagen: ${message}`);
    console.error('Hinweis: Playwright Chromium installieren (npx playwright install chromium).');
    return 1;
  }
  console.log(`Export geschrieben: ${pdfPath}`);
  return 0;
}
