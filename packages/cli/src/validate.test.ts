/**
 * @autoguide/cli — validate command tests.
 */

import { cp, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { describe, expect, it } from 'vitest';
import type { Fact } from '@autoguide/core';
import { runInit } from './commands/init.js';
import { runScan } from './commands/scan.js';
import { runValidate, runValidateCommand } from './commands/validate.js';

describe('validate command', () => {
  it('fails when .autoguide is missing', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'ag-validate-'));
    try {
      await runInit(dir);
      await rm(join(dir, '.autoguide'), { recursive: true, force: true });
      const result = await runValidate(dir);
      expect(result.ok).toBe(false);
      expect(result.errors.some((item) => item.includes('.autoguide'))).toBe(true);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('fails on schema errors', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'ag-validate-'));
    try {
      await runInit(dir);
      await writeFile(join(dir, '.autoguide/facts.json'), '[{"id":1}]', 'utf8');
      const result = await runValidate(dir);
      expect(result.ok).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('fails on stale facts and passes with --soft', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'ag-validate-'));
    try {
      const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '../../..');
      await cp(join(repoRoot, 'integrations/hr-workflows'), dir, { recursive: true });
      const scan = await runScan(dir, { noAi: true });
      expect(scan.ok).toBe(true);

      const factsPath = join(dir, '.autoguide/facts.json');
      const facts = JSON.parse(await readFile(factsPath, 'utf8')) as Fact[];
      facts[0] = {
        ...facts[0]!,
        status: 'stale',
        reviewStatus: 'approved',
        key: 'delete',
      };
      await writeFile(factsPath, JSON.stringify(facts, null, 2), 'utf8');

      const hard = await runValidate(dir);
      expect(hard.ok).toBe(false);

      const softCode = await runValidateCommand(dir, { soft: true });
      expect(softCode).toBe(0);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
