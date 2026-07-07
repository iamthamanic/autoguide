/**
 * @autoguide/cli — export command.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { readFile } from 'node:fs/promises';
import { loadConfigFromObject } from '@autoguide/config';
import type { AutoGuideConfigInput } from '@autoguide/config';
import { exportKnowledgeMarkdown } from '@autoguide/export';
import { loadArtifacts, resolveOutputDir } from '../lib/artifacts.js';

export interface ExportOptions {
  format?: 'md';
  outDir?: string;
}

export async function runExport(cwd: string, options: ExportOptions = {}): Promise<number> {
  const format = options.format ?? 'md';
  if (format !== 'md') {
    console.error(`Format nicht unterstützt: ${format}`);
    return 1;
  }

  const config = JSON.parse(
    await readFile(join(cwd, 'autoguide.config.json'), 'utf8'),
  ) as AutoGuideConfigInput;
  const resolved = loadConfigFromObject(config);
  const outputDir = await resolveOutputDir(cwd);
  const bundle = await loadArtifacts(outputDir);

  const markdown = exportKnowledgeMarkdown(bundle.pages, bundle.flows, bundle.facts, {
    mode: resolved.mode,
  });

  const targetDir = join(cwd, options.outDir ?? 'docs/autoguide-export');
  await mkdir(targetDir, { recursive: true });
  const filePath = join(targetDir, 'knowledge.md');
  await writeFile(filePath, `${markdown}\n`, 'utf8');
  console.log(`Export geschrieben: ${filePath}`);
  return 0;
}
