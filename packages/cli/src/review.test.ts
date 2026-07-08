import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, expect, it } from 'vitest';
import { runInit } from './commands/init.js';
import { runReview } from './commands/review.js';

describe('review command', () => {
  it('persists edited facts with verification history', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'ag-review-'));
    const prev = process.cwd();
    process.chdir(dir);
    try {
      await runInit(dir);
      const outputDir = join(dir, '.autoguide');
      const facts = [
        {
          id: 'fact-1',
          entityId: 'el-1',
          key: 'label',
          value: 'Save',
          status: 'needs_review',
          reviewStatus: 'pending',
          confidence: 0.4,
          provenance: [{ source: 'source_code', confidence: 0.8, observedAt: new Date().toISOString() }],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'fact-2',
          entityId: 'el-1',
          key: 'label',
          value: 'Speichern',
          status: 'verified',
          reviewStatus: 'pending',
          confidence: 0.9,
          provenance: [{ source: 'runtime_dom', confidence: 0.9, observedAt: new Date().toISOString() }],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      await writeFile(join(outputDir, 'facts.json'), JSON.stringify(facts, null, 2));
      await writeFile(
        join(outputDir, 'reviews.json'),
        JSON.stringify(
          [
            {
              factId: 'fact-1',
              entityId: 'el-1',
              key: 'label',
              value: 'Save',
              confidence: 0.4,
              reason: 'test',
            },
          ],
          null,
          2,
        ),
      );

      const code = await runReview(dir, { edit: 'fact-1', value: 'Speichern', json: true });
      expect(code).toBe(0);

      const history = JSON.parse(await readFile(join(outputDir, 'review-history.json'), 'utf8')) as Array<{
        action: string;
      }>;
      expect(history[0]?.action).toBe('verified_after_edit');
    } finally {
      process.chdir(prev);
      await rm(dir, { recursive: true, force: true });
    }
  });
});
