/**
 * @iamthamanic/autoguide-tauri — resolve .autoguide paths in Tauri app data directory.
 */

import type { AutoGuideConfigInput } from '@iamthamanic/autoguide-config';
import { isTauriRuntime } from './runtime.js';

export async function resolveAutoguideOutputDir(appId: string): Promise<string> {
  if (!isTauriRuntime()) {
    return '.autoguide';
  }
  const { appDataDir, join } = await import('@tauri-apps/api/path');
  return join(await appDataDir(), appId, '.autoguide');
}

export async function buildTauriAutoguideConfig(
  appId: string,
  overrides: Partial<AutoGuideConfigInput> = {},
): Promise<AutoGuideConfigInput> {
  const outputDir = await resolveAutoguideOutputDir(appId);
  return {
    appId,
    framework: overrides.framework ?? 'react',
    baseUrl: overrides.baseUrl ?? 'tauri://localhost',
    mode: overrides.mode ?? 'development',
    ...overrides,
    outputDir,
    ai: { provider: 'none', ...overrides.ai },
    scan: { safeMode: true, ...overrides.scan },
  };
}
