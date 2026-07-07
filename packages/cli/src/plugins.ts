/**
 * @autoguide/cli — built-in plugin bootstrap for scan/doctor.
 */

import { createPluginRegistry, type AutoGuidePlugin, type PluginRegistry } from '@autoguide/core';
import { sourceScannerPlugin } from '@autoguide/scanner';

const BUILTIN_PLUGINS: AutoGuidePlugin[] = [sourceScannerPlugin];

export function createBuiltinRegistry(configuredIds: string[] = []): PluginRegistry {
  const registry = createPluginRegistry(BUILTIN_PLUGINS);
  for (const id of configuredIds) {
    if (!registry.get(id)) {
      throw new Error(`Unbekanntes Plugin in config: ${id}`);
    }
  }
  return registry;
}
