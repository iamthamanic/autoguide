/**
 * @autoguide/cli — doctor + recommendations integration tests.
 */

import { cp, mkdtemp, readFile, rm } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { describe, expect, it } from 'vitest';
import { runScan } from './commands/scan.js';
import { runDoctor } from './commands/doctor.js';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const integrationDir = join(repoRoot, 'integrations/hr-workflows');

describe('recommendation engine integration', () => {
  it('writes recommendations.json on scan with actionable hints', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'ag-rec-scan-'));
    try {
      await cp(integrationDir, dir, { recursive: true });
      const scan = await runScan(dir, { noAi: true });
      expect(scan.ok, scan.errors.join('; ')).toBe(true);

      const recommendations = JSON.parse(
        await readFile(join(dir, '.autoguide/recommendations.json'), 'utf8'),
      ) as Array<{ category: string; message: string }>;
      expect(recommendations.length).toBeGreaterThan(0);
      expect(
        recommendations.some(
          (item) => item.category === 'metadata' || item.category === 'accessibility',
        ),
      ).toBe(true);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('doctor surfaces prioritized recommendations after scan', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'ag-rec-doctor-'));
    try {
      await cp(integrationDir, dir, { recursive: true });
      expect((await runScan(dir, { noAi: true })).ok).toBe(true);

      const doctor = await runDoctor(dir);
      expect(doctor.ok).toBe(true);
      const joined = doctor.messages.join('\n');
      expect(joined).toMatch(/Empfehlungen \(\d+, nach Priorität\)/);
      expect(joined).toMatch(/\[info\]|\[warning\]|\[blocking\]/);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
