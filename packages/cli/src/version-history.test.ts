/**
 * @iamthamanic/autoguide-cli — version history integration on rescan.
 */

import { cp, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { describe, expect, it } from 'vitest';
import type { Fact } from '@iamthamanic/autoguide-core';
import { runScan } from './commands/scan.js';

const execFileAsync = promisify(execFile);
const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const integrationDir = join(repoRoot, 'integrations/hr-workflows');

async function git(cwd: string, args: string[]): Promise<void> {
  await execFileAsync('git', args, { cwd });
}

describe('version history rescan', () => {
  it(
    'appends history and marks stale facts after source change',
    async () => {
    const dir = await mkdtemp(join(tmpdir(), 'ag-history-'));
    try {
      await cp(integrationDir, dir, { recursive: true });
      await git(dir, ['init']);
      await git(dir, ['config', 'user.email', 'autoguide@test.local']);
      await git(dir, ['config', 'user.name', 'AutoGuide Test']);
      await git(dir, ['add', '.']);
      await git(dir, ['commit', '-m', 'init', '--no-gpg-sign']);

      const first = await runScan(dir, { noAi: true });
      expect(first.ok, first.errors.join('; ')).toBe(true);

      const factsPath = join(dir, '.autoguide/facts.json');
      const facts = JSON.parse(await readFile(factsPath, 'utf8')) as Fact[];
      const target = facts.find((fact) =>
        fact.provenance.some((item) => item.filePath?.includes('App.tsx')),
      );
      expect(target).toBeDefined();
      const approvedFacts = facts.map((fact) =>
        fact.id === target!.id
          ? {
              ...fact,
              status: 'verified' as const,
              reviewStatus: 'approved' as const,
              confidence: 0.95,
            }
          : fact,
      );
      await writeFile(factsPath, JSON.stringify(approvedFacts, null, 2));

      const appPath = join(dir, 'src/App.tsx');
      const appSource = await readFile(appPath, 'utf8');
      await writeFile(appPath, `${appSource}\n// autoguide rescan marker\n`);

      const second = await runScan(dir, { noAi: true });
      expect(second.ok, second.errors.join('; ')).toBe(true);

      const historyPath = join(dir, '.autoguide/history.json');
      const history = JSON.parse(await readFile(historyPath, 'utf8')) as {
        entries: Array<{ changedFiles: string[]; staleFactIds: string[] }>;
      };
      expect(history.entries.length).toBe(2);
      const latest = history.entries.at(-1)!;
      expect(latest.changedFiles.some((file) => file.includes('App.tsx'))).toBe(true);
      expect(latest.staleFactIds).toContain(target!.id);

      const afterFacts = JSON.parse(await readFile(factsPath, 'utf8')) as Fact[];
      const staleFact = afterFacts.find((fact) => fact.id === target!.id);
      expect(staleFact?.status).toBe('stale');

      const confidence = JSON.parse(
        await readFile(join(dir, '.autoguide/confidence.json'), 'utf8'),
      ) as { staleFactIds: string[] };
      expect(confidence.staleFactIds).toContain(target!.id);

      const reviews = JSON.parse(await readFile(join(dir, '.autoguide/reviews.json'), 'utf8')) as Array<{
        factId: string;
        reason: string;
      }>;
      expect(reviews.some((item) => item.factId === target!.id && item.reason.includes('veraltet'))).toBe(
        true,
      );
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  },
    20_000,
  );
});
