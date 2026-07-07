import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { StorageWriter } from './index.js';

describe('@autoguide/storage', () => {
  it('initializes .autoguide json artifacts atomically', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'autoguide-'));
    const storage = new StorageWriter(dir);
    try {
      await storage.init();
      const pages = await readFile(storage.paths.pagesJson, 'utf8');
      expect(JSON.parse(pages)).toEqual([]);
      const app = JSON.parse(await readFile(storage.paths.appJson, 'utf8'));
      expect(app.version).toBe('0.1.0');
    } finally {
      storage.dispose();
      await rm(dir, { recursive: true, force: true });
    }
  });
});
