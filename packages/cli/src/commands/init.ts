/**
 * @iamthamanic/autoguide-cli — init command.
 */

import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { defineAutoGuideConfig } from '@iamthamanic/autoguide-config';
import { StorageWriter } from '@iamthamanic/autoguide-storage';
import { detectFramework } from '../detect.js';

export async function runInit(cwd: string): Promise<void> {
  const framework = detectFramework(cwd);
  const config = defineAutoGuideConfig({
    appId: 'my-app',
    framework: framework === 'unknown' ? 'react' : framework,
    baseUrl: 'http://localhost:5173',
  });

  const configPath = join(cwd, 'autoguide.config.json');
  const publicConfig = {
    appId: config.appId,
    framework: config.framework,
    baseUrl: config.baseUrl,
    outputDir: config.outputDir,
    mode: config.mode,
    ai: { provider: config.ai.provider, endpoint: config.ai.endpoint },
    scan: config.scan,
  };
  await writeFile(configPath, `${JSON.stringify(publicConfig, null, 2)}\n`, 'utf8');

  const storage = new StorageWriter(join(cwd, config.outputDir));
  try {
    await storage.init();
  } finally {
    storage.dispose();
  }
}
