/**
 * @autoguide/vite — resolve autoguide.config.json output directory.
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface AutoGuideConfigFile {
  outputDir?: string;
}

export function resolveAutoGuideOutputDir(
  projectRoot: string,
  configPath = 'autoguide.config.json',
): string {
  const absoluteConfig = join(projectRoot, configPath);
  if (!existsSync(absoluteConfig)) {
    return join(projectRoot, '.autoguide');
  }
  const raw = JSON.parse(readFileSync(absoluteConfig, 'utf8')) as AutoGuideConfigFile;
  const outputDir = raw.outputDir ?? '.autoguide';
  return join(projectRoot, outputDir);
}

export function readDocBundleManifest(outputDir: string): Record<string, unknown> | null {
  const manifestPath = join(outputDir, 'doc-bundle.json');
  if (!existsSync(manifestPath)) return null;
  return JSON.parse(readFileSync(manifestPath, 'utf8')) as Record<string, unknown>;
}
