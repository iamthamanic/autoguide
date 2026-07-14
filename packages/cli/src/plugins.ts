/**
 * @iamthamanic/autoguide-cli — plugin discovery and built-in bootstrap for scan/doctor.
 */

import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  createPluginRegistry,
  type AutoGuidePlugin,
  type PluginRegistry,
} from '@iamthamanic/autoguide-core';
import { sourceScannerPlugin } from '@iamthamanic/autoguide-scanner';

const BUILTIN_PLUGINS: AutoGuidePlugin[] = [sourceScannerPlugin];

export function isPluginModulePath(entry: string): boolean {
  return entry.startsWith('.') || entry.startsWith('/') || entry.includes('/');
}

async function importPluginFromPath(cwd: string, entry: string): Promise<AutoGuidePlugin> {
  const resolved = entry.startsWith('file:')
    ? entry
    : pathToFileURL(entry.startsWith('/') ? entry : join(cwd, entry)).href;
  const mod = (await import(resolved)) as Record<string, unknown>;
  const plugin = (mod.default ?? mod.plugin) as AutoGuidePlugin | undefined;
  if (!plugin?.descriptor?.id) {
    throw new Error(`Plugin-Modul exportiert kein gültiges AutoGuidePlugin: ${entry}`);
  }
  return plugin;
}

export interface LoadedPluginRegistry {
  registry: PluginRegistry;
  /** Undefined = all registered plugins are enabled. */
  enabledIds?: string[];
  warnings: string[];
}

export async function loadScanRegistry(
  cwd: string,
  entries: string[] = [],
): Promise<LoadedPluginRegistry> {
  const warnings: string[] = [];
  const registry = createPluginRegistry([...BUILTIN_PLUGINS]);
  const enabledIds = entries.length > 0 ? entries.filter((entry) => !isPluginModulePath(entry)) : undefined;

  for (const entry of entries.filter(isPluginModulePath)) {
    try {
      const plugin = await importPluginFromPath(cwd, entry);
      if (registry.get(plugin.descriptor.id)) {
        warnings.push(`Plugin ${plugin.descriptor.id} bereits registriert — ${entry} übersprungen`);
      } else {
        registry.register(plugin);
      }
      enabledIds?.push(plugin.descriptor.id);
    } catch (error) {
      warnings.push(
        error instanceof Error ? error.message : `Plugin ${entry} konnte nicht geladen werden`,
      );
    }
  }

  for (const id of entries.filter((entry) => !isPluginModulePath(entry))) {
    if (!registry.get(id)) {
      throw new Error(`Unbekanntes Plugin in config: ${id}`);
    }
  }

  return { registry, enabledIds, warnings };
}

/** @deprecated Use loadScanRegistry — kept for tests importing builtins only. */
export function createBuiltinRegistry(configuredIds: string[] = []): PluginRegistry {
  const registry = createPluginRegistry(BUILTIN_PLUGINS);
  for (const id of configuredIds) {
    if (!registry.get(id)) {
      throw new Error(`Unbekanntes Plugin in config: ${id}`);
    }
  }
  return registry;
}
