/**
 * @iamthamanic/autoguide-cli — sufficiency gate integration (scan writes sufficiency.json).
 */

import { mkdtemp, readFile, rm, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, expect, it, afterEach } from 'vitest';
import { runScan } from './commands/scan.js';
import { runDoctor } from './commands/doctor.js';
import type { SufficiencyReport } from '@iamthamanic/autoguide-core';

describe('scan sufficiency gate', () => {
  const dirs: string[] = [];

  afterEach(async () => {
    await Promise.all(dirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
  });

  it('writes sufficiency.json and doctor prints German reasons', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'ag-sufficiency-'));
    dirs.push(dir);
    await writeFile(
      join(dir, 'autoguide.config.json'),
      JSON.stringify({
        appId: 'sufficiency-test',
        framework: 'react',
        baseUrl: 'http://localhost:5173',
        outputDir: '.autoguide',
        ai: { provider: 'none' },
        scan: { safeMode: true },
      }),
      'utf8',
    );
    await mkdir(join(dir, 'src'), { recursive: true });
    await writeFile(
      join(dir, 'src', 'App.tsx'),
      `export function App() {
  return (
    <main>
      <button onClick={onSave} data-doc-id="save">Speichern</button>
      <button onClick={onCancel}>Abbrechen</button>
      <a href="/about">About</a>
    </main>
  );
}
function onSave() {}
function onCancel() {}
`,
      'utf8',
    );

    const scan = await runScan(dir, { sourceDir: 'src', noAi: true });
    expect(scan.ok).toBe(true);
    expect(scan.sufficiency).toBeDefined();
    expect(['sufficient', 'escalate', 'blocked']).toContain(scan.sufficiency!.status);
    expect(scan.warnings.some((w) => w.startsWith('Sufficiency ('))).toBe(true);

    const raw = JSON.parse(
      await readFile(join(dir, '.autoguide', 'sufficiency.json'), 'utf8'),
    ) as SufficiencyReport;
    expect(raw.status).toBe(scan.sufficiency!.status);
    expect(raw.reasons.length).toBeGreaterThan(0);
    expect(raw.reasons.every((r) => typeof r.messageDe === 'string')).toBe(true);

    const doctor = await runDoctor(dir);
    expect(doctor.messages.some((m) => m.startsWith('Sufficiency ('))).toBe(true);
  });
});
