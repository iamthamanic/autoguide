/**
 * @iamthamanic/autoguide-cli — sync command tests.
 */

import { cp, mkdtemp, readFile, rm, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { runSync, RUNTIME_ARTIFACTS } from './commands/sync.js';
import { runGenerateBundle } from './commands/generate.js';
import { runScan } from './commands/scan.js';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const integrationDir = join(repoRoot, 'integrations/hr-workflows');

describe('sync command', () => {
  it('copies runtime artifacts to target directory', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'ag-sync-'));
    try {
      await cp(integrationDir, dir, { recursive: true });
      expect((await runScan(dir, { noAi: true })).ok).toBe(true);
      expect((await runGenerateBundle(dir)).ok).toBe(true);

      const target = join(dir, 'public/autoguide');
      const result = await runSync(dir, { target });

      expect(result.ok).toBe(true);
      expect(result.copied).toContain('facts.json');
      expect(result.copied).toContain('pages.json');
      expect(result.copied).toContain('flows.json');
      expect(result.copied).toContain('tours.json');
      expect(result.copied).toContain('doc-bundle.json');
      expect(existsSync(join(target, 'facts.json'))).toBe(true);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('copies reviews.json so the runtime Review panel stays in sync', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'ag-sync-reviews-'));
    try {
      await cp(integrationDir, dir, { recursive: true });
      expect((await runScan(dir, { noAi: true })).ok).toBe(true);

      const reviews = [
        { factId: 'fact-pending', reason: 'Unsicherer Scan-Eintrag', createdAt: '2026-07-17T00:00:00.000Z' },
      ];
      const history = [
        {
          factId: 'fact-pending',
          entityId: 'el-1',
          key: 'label',
          action: 'pending',
          at: '2026-07-17T00:00:00.000Z',
        },
      ];
      await writeFile(join(dir, '.autoguide/reviews.json'), JSON.stringify(reviews), 'utf8');
      await writeFile(join(dir, '.autoguide/review-history.json'), JSON.stringify(history), 'utf8');

      const target = join(dir, 'public/autoguide');
      const result = await runSync(dir, { target });

      expect(result.ok).toBe(true);
      expect(result.copied).toContain('reviews.json');
      expect(result.copied).toContain('review-history.json');
      expect(RUNTIME_ARTIFACTS).toContain('reviews.json');

      const syncedReviews = JSON.parse(
        await readFile(join(target, 'reviews.json'), 'utf8'),
      ) as typeof reviews;
      expect(syncedReviews).toHaveLength(1);
      expect(syncedReviews[0]?.factId).toBe('fact-pending');

      const syncedHistory = JSON.parse(
        await readFile(join(target, 'review-history.json'), 'utf8'),
      ) as typeof history;
      expect(syncedHistory[0]?.action).toBe('pending');
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('creates target directory if missing', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'ag-sync-mkdir-'));
    try {
      await cp(integrationDir, dir, { recursive: true });
      expect((await runScan(dir, { noAi: true })).ok).toBe(true);

      const target = join(dir, 'deep/nested/autoguide');
      const result = await runSync(dir, { target });

      expect(result.ok).toBe(true);
      expect(existsSync(join(target, 'facts.json'))).toBe(true);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('clean flag removes stale files in target', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'ag-sync-clean-'));
    try {
      await cp(integrationDir, dir, { recursive: true });
      expect((await runScan(dir, { noAi: true })).ok).toBe(true);

      const target = join(dir, 'public/autoguide');
      await mkdir(target, { recursive: true });
      await writeFile(join(target, 'stale.txt'), 'old');

      const result = await runSync(dir, { target, clean: true });
      expect(result.ok).toBe(true);
      expect(existsSync(join(target, 'stale.txt'))).toBe(false);
      expect(existsSync(join(target, 'facts.json'))).toBe(true);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('fails gracefully when .autoguide is missing', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'ag-sync-empty-'));
    try {
      const configPath = join(dir, 'autoguide.config.json');
      await writeFile(configPath, JSON.stringify({ appId: 'test', outputDir: '.autoguide' }, null, 2));

      const result = await runSync(dir, { target: join(dir, 'public') });
      expect(result.ok).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});