/**
 * @iamthamanic/autoguide-cli — project framework detection.
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export type DetectedFramework = 'react' | 'vue' | 'angular' | 'svelte' | 'unknown';

export function detectFramework(cwd: string): DetectedFramework {
  const pkgPath = join(cwd, 'package.json');
  if (!existsSync(pkgPath)) return 'unknown';
  try {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    if (deps.react) return 'react';
    if (deps.vue) return 'vue';
    if (deps['@angular/core']) return 'angular';
    if (deps.svelte) return 'svelte';
  } catch {
    return 'unknown';
  }
  return 'unknown';
}
