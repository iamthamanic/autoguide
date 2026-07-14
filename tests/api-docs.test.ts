import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('public API documentation', () => {
  const apiDir = resolve('docs/api');

  it('has docs/api/README.md index', () => {
    expect(existsSync(resolve(apiDir, 'README.md'))).toBe(true);
    const readme = readFileSync(resolve(apiDir, 'README.md'), 'utf8');
    expect(readme).toContain('@iamthamanic/autoguide-core');
    expect(readme).toContain('[cli.md](./cli.md)');
  });

  it('documents core public exports', () => {
    const core = readFileSync(resolve(apiDir, 'core.md'), 'utf8');
    for (const symbol of [
      'Fact',
      'KnowledgeGraph',
      'ReviewQueue',
      'generateRecommendations',
      'PluginRegistry',
    ]) {
      expect(core).toContain(symbol);
    }
    expect(core).toContain('./types/fact.js');
  });

  it('documents cli and react packages', () => {
    const cli = readFileSync(resolve(apiDir, 'cli.md'), 'utf8');
    expect(cli).toContain('scan');
    expect(cli).toContain('validate');

    const react = readFileSync(resolve(apiDir, 'react.md'), 'utf8');
    expect(react).toContain('AutoGuideProvider');
    expect(react).toContain('AutoGuideWidget');
  });

  it('PRD reflects Phase 3 delivery and deferred items', () => {
    const prd = readFileSync(resolve('docs/PRD.md'), 'utf8');
    expect(prd).toContain('Delivery status (Phase 2–3');
    expect(prd).toContain('Still deferred');
    expect(prd).toContain('Hosted sync');
    expect(prd).toContain('hr-workflows integration');
  });

  it('hr-workflows acceptance marks integration test regression', () => {
    const acceptance = readFileSync(
      resolve('.qa/acceptance/hr-workflows-integration.md'),
      'utf8',
    );
    expect(acceptance).toContain('[x]');
    expect(acceptance).toContain('hr-workflows.integration.test.ts');
  });
});
