/**
 * @iamthamanic/autoguide-cli — getCliVersion unit tests.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { getCliVersion } from './cli-version.js';

describe('getCliVersion', () => {
  it('matches packages/cli package.json and is not the stale 0.1.0 banner', () => {
    const pkgPath = join(dirname(fileURLToPath(import.meta.url)), '../../package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as { version: string };
    expect(getCliVersion()).toBe(pkg.version);
    expect(getCliVersion()).not.toBe('0.1.0');
  });
});
