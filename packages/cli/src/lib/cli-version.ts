/**
 * @iamthamanic/autoguide-cli — resolve published package version for --version.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Reads version from this package's package.json (not a hardcoded banner). */
export function getCliVersion(): string {
  try {
    const pkgPath = join(dirname(fileURLToPath(import.meta.url)), '../../package.json');
    const raw = readFileSync(pkgPath, 'utf8');
    const pkg = JSON.parse(raw) as { version?: unknown };
    const version = typeof pkg.version === 'string' ? pkg.version.trim() : '';
    return version || '0.0.0';
  } catch {
    return '0.0.0';
  }
}
