/**
 * @autoguide/cli — browo-hr dogfood integration test (issue #41).
 */

import { cp, mkdtemp, readFile, rm } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { describe, expect, it } from 'vitest';
import { filterByRole, filterFactsForMode } from '@autoguide/core';
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

      const employeeFlows = filterByRole(bundle.flows, 'Mitarbeiter');
      const adminFlows = filterByRole(bundle.flows, 'HR-Admin');
      expect(employeeFlows.length).toBeGreaterThanOrEqual(2);
      expect(adminFlows.length).toBeGreaterThanOrEqual(1);

      const exitCode = await runExport(dir, { outDir: 'docs/export' });
      expect(exitCode).toBe(0);
      const exported = await readFile(join(dir, 'docs/export/knowledge.md'), 'utf8');
      expect(exported).toContain('# AutoGuide Dokumentation');

      const roleExport = await runExport(dir, {
        outDir: 'docs/export-mitarbeiter',
        role: 'Mitarbeiter',
      });
      expect(roleExport).toBe(0);
      const roleMd = await readFile(join(dir, 'docs/export-mitarbeiter/knowledge.md'), 'utf8');
      expect(roleMd).toContain('(Mitarbeiter)');
      expect(roleMd).toMatch(/Wiki/i);
      expect(roleMd).not.toMatch(/Stammdaten/i);

      const htmlExit = await runExport(dir, { format: 'html', outDir: 'docs/export-html' });
      expect(htmlExit).toBe(0);
      const html = await readFile(join(dir, 'docs/export-html/knowledge.html'), 'utf8');
      expect(html).toContain('<html lang="de">');
      expect(html).toContain('AutoGuide Dokumentation');
      expect(html).toMatch(/Wiki|Stammdaten|Mitarbeiter/i);

      let chromiumAvailable = true;
      try {
        const { chromium } = await import('playwright');
        const browser = await chromium.launch();
        await browser.close();
      } catch {
        chromiumAvailable = false;
      }
      if (chromiumAvailable) {
        const pdfExit = await runExport(dir, { format: 'pdf', outDir: 'docs/export-pdf' });
        expect(pdfExit).toBe(0);
        const pdf = await readFile(join(dir, 'docs/export-pdf/knowledge.pdf'));
        expect(pdf.subarray(0, 4).toString()).toBe('%PDF');
      }
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
