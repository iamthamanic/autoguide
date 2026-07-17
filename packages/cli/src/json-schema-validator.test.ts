import { existsSync } from 'node:fs';
import { cp, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { describe, expect, it } from 'vitest';
import { runScan } from './commands/scan.js';
import {
  resolveSchemaDir,
  validateArtifactJson,
  validateArtifactsWithJsonSchema,
} from './lib/json-schema-validator.js';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const integrationDir = join(repoRoot, 'integrations/hr-workflows');
const realSchemasDir = join(repoRoot, 'packages/core/schemas');

describe('JSON Schema artifact validation', () => {
  it('resolves schemas via autoguide-core package entry (npm-safe)', () => {
    const dir = resolveSchemaDir();
    expect(existsSync(join(dir, 'facts.schema.json'))).toBe(true);
    expect(existsSync(join(dir, 'shared.schema.json'))).toBe(true);
  });

  it('resolves schemas from a simulated npm node_modules layout', async () => {
    const tmp = await mkdtemp(join(tmpdir(), 'ag-schema-npm-'));
    try {
      const coreRoot = join(tmp, 'node_modules/@iamthamanic/autoguide-core');
      const coreDist = join(coreRoot, 'dist');
      const coreSchemas = join(coreRoot, 'schemas');
      await mkdir(coreDist, { recursive: true });
      await writeFile(join(coreDist, 'index.js'), 'export {};\n');
      await writeFile(
        join(coreRoot, 'package.json'),
        JSON.stringify({
          name: '@iamthamanic/autoguide-core',
          type: 'module',
          main: './dist/index.js',
          exports: { '.': './dist/index.js' },
        }),
      );
      await cp(realSchemasDir, coreSchemas, { recursive: true });

      const fakeCliLib = join(tmp, 'node_modules/@iamthamanic/autoguide-cli/dist/lib');
      await mkdir(fakeCliLib, { recursive: true });
      const brokenRelative = join(fakeCliLib, '../../../core/schemas');
      expect(existsSync(brokenRelative), 'old ../../../core/schemas path must fail under npm').toBe(
        false,
      );

      const dir = resolveSchemaDir(() => join(coreDist, 'index.js'));
      expect(dir).toBe(coreSchemas);
      expect(existsSync(join(dir, 'facts.schema.json'))).toBe(true);
    } finally {
      await rm(tmp, { recursive: true, force: true });
    }
  });

  it('rejects invalid facts payloads', () => {
    const errors = validateArtifactJson('facts.schema.json', [{ id: 1 }]);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('accepts a minimal valid fact', () => {
    const errors = validateArtifactJson('facts.schema.json', [
      {
        id: 'f1',
        entityId: 'el-1',
        key: 'label',
        value: 'Save',
        status: 'verified',
        reviewStatus: 'pending',
        confidence: 0.9,
        provenance: [
          {
            source: 'source_code',
            confidence: 0.9,
            observedAt: '2026-01-01T00:00:00.000Z',
          },
        ],
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    ]);
    expect(errors).toEqual([]);
  });

  it('validates hr-workflows scan artifacts against committed schemas', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'ag-schema-hr-'));
    try {
      await cp(integrationDir, dir, { recursive: true });
      const scan = await runScan(dir, { noAi: true });
      expect(scan.ok, scan.errors.join('; ')).toBe(true);

      const outputDir = join(dir, '.autoguide');
      const { readFile } = await import('node:fs/promises');
      const [pages, features, flows, facts, confidence] = await Promise.all([
        readFile(join(outputDir, 'pages.json'), 'utf8').then((raw) => JSON.parse(raw)),
        readFile(join(outputDir, 'features.json'), 'utf8').then((raw) => JSON.parse(raw)),
        readFile(join(outputDir, 'flows.json'), 'utf8').then((raw) => JSON.parse(raw)),
        readFile(join(outputDir, 'facts.json'), 'utf8').then((raw) => JSON.parse(raw)),
        readFile(join(outputDir, 'confidence.json'), 'utf8').then((raw) => JSON.parse(raw)),
      ]);

      const errors = validateArtifactsWithJsonSchema({ pages, features, flows, facts, confidence });
      expect(errors, errors.join('\n')).toEqual([]);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
