import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('flutter adapter', () => {
  it('ships plugin package and example app scaffolding', () => {
    const pluginRoot = resolve('plugins/flutter');
    expect(existsSync(resolve(pluginRoot, 'pubspec.yaml'))).toBe(true);
    expect(existsSync(resolve(pluginRoot, 'lib/autoguide_flutter.dart'))).toBe(true);
    expect(existsSync(resolve(pluginRoot, 'lib/src/autoguide_widget.dart'))).toBe(true);
    expect(existsSync(resolve(pluginRoot, 'README.md'))).toBe(true);

    const exampleRoot = resolve('examples/flutter_app');
    expect(existsSync(resolve(exampleRoot, 'pubspec.yaml'))).toBe(true);
    expect(existsSync(resolve(exampleRoot, 'lib/main.dart'))).toBe(true);
    expect(existsSync(resolve(exampleRoot, 'README.md'))).toBe(true);
  });

  it('documents core bridge in plugin README', () => {
    const readme = readFileSync(resolve('plugins/flutter/README.md'), 'utf8');
    expect(readme).toContain('AssetCoreBridge');
    expect(readme).toContain('AutoGuideScope');
  });
});
