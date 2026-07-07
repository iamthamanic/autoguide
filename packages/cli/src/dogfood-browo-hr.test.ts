/**
 * @autoguide/cli — browo-hr dogfood integration test (issue #41).
 */

import { cp, mkdtemp, readFile, rm } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { describe, expect, it } from 'vitest';
import { filterFactsForMode } from '@autoguide/core';
import { exportKnowledgeMarkdown } from '@autoguide/export';
import { runScan } from './commands/scan.js';
import { runExport } from './commands/export.js';
import { loadArtifacts } from './lib/artifacts.js';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const dogfoodDir = join(repoRoot, 'dogfood/browo-hr');

describe('dogfood browo-hr', () => {
  it('produces three ordered flows from Playwright import and German markdown export', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'ag-dogfood-'));
    try {
      await cp(dogfoodDir, dir, { recursive: true });
      const scan = await runScan(dir, { noAi: true });
      expect(scan.ok, scan.errors.join('; ')).toBe(true);

      const bundle = await loadArtifacts(join(dir, '.autoguide'));
      expect(bundle.flows.length).toBeGreaterThanOrEqual(3);
      for (const flow of bundle.flows.slice(0, 3)) {
        expect(flow.steps.length).toBeGreaterThanOrEqual(2);
        expect(flow.steps[0]?.order).toBe(1);
      }

      const devMd = exportKnowledgeMarkdown(bundle.pages, bundle.flows, bundle.facts, {
        mode: 'development',
      });
      expect(devMd).toContain('AutoGuide Dokumentation');
      expect(devMd).toContain('## Schritte');
      expect(devMd).toMatch(/Wiki|Stammdaten|Mitarbeiter/i);

      const publishedFacts = filterFactsForMode(bundle.facts, 'published');
      expect(publishedFacts.length).toBeLessThan(bundle.facts.length);

      const exitCode = await runExport(dir, { outDir: 'docs/export' });
      expect(exitCode).toBe(0);
      const exported = await readFile(join(dir, 'docs/export/knowledge.md'), 'utf8');
      expect(exported).toContain('# AutoGuide Dokumentation');
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
