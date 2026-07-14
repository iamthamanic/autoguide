/**
 * @iamthamanic/autoguide-vite — resolve helper tests.
 */

import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, expect, it } from 'vitest';
import { readDocBundleManifest, resolveAutoGuideOutputDir } from './resolve.js';

describe('resolveAutoGuideOutputDir', () => {
  it('defaults to .autoguide when config is missing', () => {
    const root = mkdtempSync(join(tmpdir(), 'ag-vite-'));
    expect(resolveAutoGuideOutputDir(root)).toBe(join(root, '.autoguide'));
  });

  it('reads outputDir from autoguide.config.json', () => {
    const root = mkdtempSync(join(tmpdir(), 'ag-vite-'));
    writeFileSync(
      join(root, 'autoguide.config.json'),
      JSON.stringify({ outputDir: 'custom-out' }),
    );
    expect(resolveAutoGuideOutputDir(root)).toBe(join(root, 'custom-out'));
  });

  it('reads doc-bundle manifest when present', () => {
    const root = mkdtempSync(join(tmpdir(), 'ag-vite-'));
    const out = join(root, '.autoguide');
    mkdirSync(out, { recursive: true });
    writeFileSync(
      join(out, 'doc-bundle.json'),
      JSON.stringify({ artifacts: ['facts.json'] }),
    );
    expect(readDocBundleManifest(out)).toEqual({ artifacts: ['facts.json'] });
  });
});
