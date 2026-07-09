/**
 * @autoguide/playwright — capture-runtime integration (unreachable host).
 */

import { describe, expect, it } from 'vitest';
import { captureRuntimeSnapshots } from './capture-runtime.js';

describe('captureRuntimeSnapshots', () => {
  it('returns warnings when host is unreachable', async () => {
    const result = await captureRuntimeSnapshots({
      baseUrl: 'http://127.0.0.1:1',
      routes: ['/'],
    });
    expect(result.snapshots).toHaveLength(0);
    expect(result.skippedRoutes).toContain('/');
    expect(result.warnings.some((warning) => warning.includes('Runtime-Scan fehlgeschlagen'))).toBe(
      true,
    );
  }, 15_000);
});
