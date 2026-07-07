import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { runInit } from './commands/init.js';
import { runDoctor } from './commands/doctor.js';

describe('@autoguide/cli', () => {
  it('init creates config and .autoguide', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'ag-cli-'));
    const prev = process.cwd();
    process.chdir(dir);
    try {
      await runInit(dir);
      const doctor = await runDoctor(dir);
      expect(doctor.ok).toBe(true);
      const config = JSON.parse(await readFile(join(dir, 'autoguide.config.json'), 'utf8'));
      expect(config.appId).toBe('my-app');
    } finally {
      process.chdir(prev);
      await rm(dir, { recursive: true, force: true });
    }
  });
});
