/**
 * @autoguide/vite — Vite plugin for AutoGuide runtime artifacts.
 */

import { cpSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { Plugin } from 'vite';
import { readDocBundleManifest, resolveAutoGuideOutputDir } from './resolve.js';

export const VIRTUAL_AUTOGuide_MODULE_ID = 'virtual:autoguide';
const RESOLVED_VIRTUAL_ID = '\0virtual:autoguide';

export interface AutoGuideVitePluginOptions {
  /** Path to autoguide.config.json relative to Vite root. */
  configPath?: string;
  /** Copy JSON artifacts to public/autoguide during dev/build. Default true. */
  copyPublic?: boolean;
  /** Public URL path served to the host app. */
  bundleBase?: string;
  /** Subdirectory under Vite public dir. */
  publicSubdir?: string;
}

function copyJsonArtifacts(sourceDir: string, targetDir: string): void {
  if (!existsSync(sourceDir)) return;
  mkdirSync(targetDir, { recursive: true });
  for (const entry of readdirSync(sourceDir)) {
    if (!entry.endsWith('.json')) continue;
    cpSync(join(sourceDir, entry), join(targetDir, entry));
  }
}

export function autoguide(options: AutoGuideVitePluginOptions = {}): Plugin {
  const bundleBase = options.bundleBase ?? '/autoguide';
  const publicSubdir = options.publicSubdir ?? 'autoguide';
  const copyPublic = options.copyPublic ?? true;
  let projectRoot = '';

  return {
    name: 'autoguide',
    configResolved(config) {
      projectRoot = config.root;
    },
    resolveId(id) {
      if (id === VIRTUAL_AUTOGuide_MODULE_ID) return RESOLVED_VIRTUAL_ID;
    },
    load(id) {
      if (id !== RESOLVED_VIRTUAL_ID) return null;
      const outputDir = resolveAutoGuideOutputDir(projectRoot, options.configPath);
      const manifest = readDocBundleManifest(outputDir);
      const payload = { bundleBase, manifest, outputDir };
      return `export default ${JSON.stringify(payload)};\nexport const bundleBase = ${JSON.stringify(bundleBase)};\nexport const manifest = ${JSON.stringify(manifest)};`;
    },
    buildStart() {
      if (!copyPublic || !projectRoot) return;
      const outputDir = resolveAutoGuideOutputDir(projectRoot, options.configPath);
      const targetDir = join(projectRoot, 'public', publicSubdir);
      copyJsonArtifacts(outputDir, targetDir);
      if (!existsSync(outputDir)) {
        this.warn(
          `AutoGuide: Kein Artefakt-Ordner unter ${outputDir}. Führe zuerst \`autoguide scan\` aus.`,
        );
      }
    },
    configureServer(server) {
      if (!copyPublic || !projectRoot) return;
      const outputDir = resolveAutoGuideOutputDir(projectRoot, options.configPath);
      const targetDir = join(projectRoot, 'public', publicSubdir);
      copyJsonArtifacts(outputDir, targetDir);
      server.watcher.add(outputDir);
      server.watcher.on('change', (file) => {
        if (!file.startsWith(outputDir) || !file.endsWith('.json')) return;
        const name = file.slice(outputDir.length + 1);
        cpSync(file, join(targetDir, name));
      });
    },
  };
}

export default autoguide;
