/**
 * @autoguide/cli — plugin discovery and scan integration tests.
 */

import { cp, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { describe, expect, it } from 'vitest';
import { isFact } from '@autoguide/core';
import { runScan } from './commands/scan.js';
import { loadScanRegistry } from './plugins.js';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const integrationDir = join(repoRoot, 'integrations/hr-workflows');
const stubPluginPath = join(repoRoot, 'examples/stub-plugin/index.ts');

describe('plugin discovery', () => {
  it('loads third-party plugin module from config path', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'ag-plugin-load-'));
    try {
      const { registry } = await loadScanRegistry(dir, [stubPluginPath]);
      const entry = registry.describeCapabilities().find((item) => item.id === 'example-stub-scanner');
      expect(entry?.capabilities).toContain('scan');
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('scan merges plugin facts and validates schema', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'ag-plugin-scan-'));
    try {
      await cp(integrationDir, dir, { recursive: true });
      const configPath = join(dir, 'autoguide.config.json');
      const config = JSON.parse(await readFile(configPath, 'utf8')) as Record<string, unknown>;
      config.plugins = [stubPluginPath];
      await writeFile(configPath, JSON.stringify(config, null, 2));

      const scan = await runScan(dir, { noAi: true });
      expect(scan.ok, scan.errors.join('; ')).toBe(true);

      const facts = JSON.parse(await readFile(join(dir, '.autoguide/facts.json'), 'utf8')) as unknown[];
      const pluginFact = facts.find(
        (item) => isFact(item) && item.key === 'plugin.note',
      );
      expect(pluginFact).toBeTruthy();
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
