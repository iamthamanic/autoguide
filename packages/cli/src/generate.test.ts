/**
 * @autoguide/cli — generate command tests.
 */

import { cp, mkdtemp, readFile, rm } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { describe, expect, it } from 'vitest';
import { validateTours } from '@autoguide/core';
import { runGenerate, runGenerateBundle, runGenerateTours } from './commands/generate.js';
import { runScan } from './commands/scan.js';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const integrationDir = join(repoRoot, 'integrations/hr-workflows');

describe('generate command', () => {
  it('writes tours.json from existing flows', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'ag-generate-'));
    try {
      await cp(integrationDir, dir, { recursive: true });
      const scan = await runScan(dir, { noAi: true });
      expect(scan.ok).toBe(true);

      const code = await runGenerate(dir, 'tours');
      expect(code).toBe(0);

      const toursPath = join(dir, '.autoguide/tours.json');
      const tours = JSON.parse(await readFile(toursPath, 'utf8'));
      expect(Array.isArray(tours)).toBe(true);
      expect(tours.length).toBeGreaterThan(0);
      expect(validateTours(tours)).toEqual([]);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('bundle writes tours, recommendations, and doc-bundle manifest', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'ag-generate-bundle-'));
    try {
      await cp(integrationDir, dir, { recursive: true });
      expect((await runScan(dir, { noAi: true })).ok).toBe(true);

      const result = await runGenerateBundle(dir);
      expect(result.ok).toBe(true);
      expect(result.written).toContain('doc-bundle.json');

      const manifest = JSON.parse(
        await readFile(join(dir, '.autoguide/doc-bundle.json'), 'utf8'),
      ) as { artifacts: string[] };
      expect(manifest.artifacts).toContain('tours.json');
      expect(manifest.artifacts).toContain('recommendations.json');
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
