/**
 * @iamthamanic/autoguide-cli — explicit --playwright-import → ordered flows (issue #138).
 */

import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, expect, it } from 'vitest';
import { runInit } from './commands/init.js';
import { runScan } from './commands/scan.js';
import { runDoctor } from './commands/doctor.js';
import { FLOW_SEEDING_HINT } from './lib/flow-seeding-hint.js';

const MINIMAL_REPORT = {
  suites: [
    {
      title: 'Example - Save (User)',
      file: 'e2e/save.spec.ts',
      specs: [
        {
          title: 'Aktion speichern',
          tests: [
            {
              title: 'User speichert eine Aktion',
              results: [
                {
                  steps: [
                    { title: 'goto /', category: 'pw:api' },
                    { title: 'click Speichern', category: 'pw:api' },
                    { title: 'Erfolg prüfen', category: 'pw:api' },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

describe('playwright-import → ordered flows', () => {
  it('writes ≥1 ordered flow from --playwright-import and doctor stays quiet', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'ag-pw-import-'));
    try {
      await runInit(dir);
      await mkdir(join(dir, 'src'), { recursive: true });
      const reportPath = join(dir, 'fixtures', 'playwright-report.json');
      await mkdir(join(dir, 'fixtures'), { recursive: true });
      await writeFile(reportPath, JSON.stringify(MINIMAL_REPORT), 'utf8');

      const scan = await runScan(dir, {
        noAi: true,
        playwrightReport: 'fixtures/playwright-report.json',
      });
      expect(scan.ok, scan.errors.join('; ')).toBe(true);
      expect(scan.warnings.some((w) => w.includes(FLOW_SEEDING_HINT))).toBe(false);

      const flows = JSON.parse(
        await readFile(join(dir, '.autoguide/flows.json'), 'utf8'),
      ) as Array<{ title: string; steps: Array<{ order: number; title: string }> }>;
      expect(flows.length).toBeGreaterThanOrEqual(1);
      expect(flows[0]?.steps.length).toBeGreaterThanOrEqual(2);
      expect(flows[0]?.steps[0]?.order).toBe(1);
      expect(flows[0]?.steps.map((s) => s.title).join(' ')).toMatch(/Speichern|goto/);

      const doctor = await runDoctor(dir);
      expect(doctor.messages.some((m) => m.includes('mit Schritten'))).toBe(true);
      expect(doctor.messages.some((m) => m === FLOW_SEEDING_HINT)).toBe(false);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('warns in German when playwright import path is missing', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'ag-pw-missing-'));
    try {
      await runInit(dir);
      await mkdir(join(dir, 'src'), { recursive: true });
      const scan = await runScan(dir, {
        noAi: true,
        playwrightReport: 'fixtures/does-not-exist.json',
      });
      expect(scan.ok).toBe(true);
      expect(
        scan.warnings.some((w) => w.includes('Playwright-Report nicht gefunden')),
      ).toBe(true);
      expect(scan.warnings.some((w) => w === FLOW_SEEDING_HINT)).toBe(true);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('doctor hints when flows exist but have no steps', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'ag-pw-empty-steps-'));
    try {
      await runInit(dir);
      await writeFile(
        join(dir, '.autoguide/flows.json'),
        JSON.stringify([{ id: 'flow-1', title: 'Leer', steps: [], status: 'draft' }]),
        'utf8',
      );
      const doctor = await runDoctor(dir);
      expect(doctor.messages).toContain(FLOW_SEEDING_HINT);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
