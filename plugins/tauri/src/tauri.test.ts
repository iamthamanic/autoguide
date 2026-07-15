import { describe, expect, it } from 'vitest';
import { buildTauriAutoguideConfig } from './paths.js';
import { isTauriRuntime } from './runtime.js';

describe('@iamthamanic/autoguide-tauri', () => {
  it('detects non-tauri node context', () => {
    expect(isTauriRuntime()).toBe(false);
  });

  it('builds config with local output dir outside tauri', async () => {
    const config = await buildTauriAutoguideConfig('scriptony-multihost');
    expect(config.appId).toBe('scriptony-multihost');
    expect(config.outputDir).toBe('.autoguide');
    expect(config.ai?.provider).toBe('none');
  });
});
