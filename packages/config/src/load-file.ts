/**
 * @autoguide/config — load autoguide.config.json from disk.
 */

import { readFile } from 'node:fs/promises';
import { loadConfigFromObject } from './load.js';
import type { AutoGuideConfig, AutoGuideConfigInput } from './types.js';

export async function loadConfigFromFile(path: string): Promise<AutoGuideConfig> {
  const raw = JSON.parse(await readFile(path, 'utf8')) as AutoGuideConfigInput;
  return loadConfigFromObject(raw);
}
