import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { StorageWriter } from './index.js';

describe('@iamthamanic/autoguide-storage', () => {
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

  it('redacts secrets from persisted json artifacts', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'autoguide-redact-'));
    const storage = new StorageWriter(dir);
    try {
      await storage.writeJson(storage.paths.factsJson, [
        {
          id: 'f1',
          entityId: 'el-1',
          key: 'note',
          value: 'contact max@example.com token Bearer abcdefghijklmnop',
          status: 'verified',
          reviewStatus: 'approved',
          confidence: 0.9,
          provenance: [],
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
      ]);
      const raw = await readFile(storage.paths.factsJson, 'utf8');
      expect(raw).not.toContain('max@example.com');
      expect(raw).not.toContain('Bearer abcdefghijklmnop');
      expect(raw).toContain('[REDACTED]');
    } finally {
      storage.dispose();
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('redacts secrets from sqlite index values', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'autoguide-sqlite-'));
    const storage = new StorageWriter(dir);
    try {
      storage.index.upsertFlowIndex({
        id: 'flow-1',
        title: 'Reset password',
        body: 'email user@corp.example password=secret123',
        status: 'draft',
        updatedAt: '2026-01-01T00:00:00.000Z',
      });
      const row = storage.index.db
        .prepare('SELECT body FROM flows_index WHERE id = ?')
        .get('flow-1') as { body: string };
      expect(row.body).not.toContain('user@corp.example');
      expect(row.body).not.toContain('secret123');
    } finally {
      storage.dispose();
      await rm(dir, { recursive: true, force: true });
    }
  });
});
