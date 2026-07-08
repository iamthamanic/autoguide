import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('monorepo foundation', () => {
  it('has pnpm workspace globs for packages, plugins, examples', () => {
    const workspace = readFileSync(resolve('pnpm-workspace.yaml'), 'utf8');
    expect(workspace).toContain("packages/*");
    expect(workspace).toContain("plugins/*");
    expect(workspace).toContain("examples/*");
  });

  it('enables TypeScript strict mode in base config', () => {
    const base = JSON.parse(readFileSync(resolve('tsconfig.base.json'), 'utf8'));
    expect(base.compilerOptions.strict).toBe(true);
  });

  it('packages/ui has no React dependency', () => {
    const pkg = JSON.parse(readFileSync(resolve('packages/ui/package.json'), 'utf8')) as {
      dependencies?: Record<string, string>;
      peerDependencies?: Record<string, string>;
    };
    const deps = { ...pkg.dependencies, ...pkg.peerDependencies };
    expect(Object.keys(deps).some((name) => name.includes('react'))).toBe(false);
  });
});
