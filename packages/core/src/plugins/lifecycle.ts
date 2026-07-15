/**
 * @iamthamanic/autoguide-core — plugin setup / scan / transform lifecycle with isolated failures.
 */

import type { Fact } from '../types/fact.js';
import { isFact } from '../validators/fact.js';
import { KnowledgeGraph } from '../graph/knowledge-graph.js';
import { isPluginCompatible } from './compatibility.js';
import type {
  AutoGuidePlugin,
  PluginRegistry,
  PluginScanContext,
  PluginSetupContext,
} from './registry.js';

export interface PluginLifecycleWarning {
  pluginId: string;
  phase: 'setup' | 'scan' | 'transform' | 'cleanup' | 'compatibility';
  message: string;
}

export interface PluginScanRunResult {
  facts: Fact[];
  warnings: PluginLifecycleWarning[];
}

function shouldRunPlugin(plugin: AutoGuidePlugin, enabledIds?: string[]): boolean {
  if (!enabledIds || enabledIds.length === 0) return true;
  return enabledIds.includes(plugin.descriptor.id);
}

function compatibilityWarning(plugin: AutoGuidePlugin): PluginLifecycleWarning | null {
  if (isPluginCompatible(plugin.descriptor.autoguideVersion)) return null;
  return {
    pluginId: plugin.descriptor.id,
    phase: 'compatibility',
    message: `Plugin ${plugin.descriptor.id} erfordert AutoGuide ${plugin.descriptor.autoguideVersion}`,
  };
}

export async function runPluginSetup(
  registry: PluginRegistry,
  context: PluginSetupContext,
  enabledIds?: string[],
): Promise<PluginLifecycleWarning[]> {
  const warnings: PluginLifecycleWarning[] = [];
  for (const plugin of registry.listPlugins()) {
    if (!shouldRunPlugin(plugin, enabledIds) || !plugin.setup) continue;
    const compat = compatibilityWarning(plugin);
    if (compat) {
      warnings.push(compat);
      continue;
    }
    try {
      await plugin.setup(context);
    } catch (error) {
      warnings.push({
        pluginId: plugin.descriptor.id,
        phase: 'setup',
        message: error instanceof Error ? error.message : 'Setup fehlgeschlagen',
      });
    }
  }
  return warnings;
}

export async function runPluginScans(
  registry: PluginRegistry,
  context: PluginScanContext,
  enabledIds?: string[],
): Promise<PluginScanRunResult> {
  const facts: Fact[] = [];
  const warnings: PluginLifecycleWarning[] = [];

  for (const plugin of registry.listPlugins('scanner')) {
    if (!shouldRunPlugin(plugin, enabledIds) || !plugin.scan) continue;
    if (!plugin.descriptor.capabilities.includes('scan')) continue;

    const compat = compatibilityWarning(plugin);
    if (compat) {
      warnings.push(compat);
      continue;
    }

    try {
      const result = await plugin.scan(context);
      for (const fact of result.facts) {
        if (!isFact(fact)) {
          warnings.push({
            pluginId: plugin.descriptor.id,
            phase: 'scan',
            message: 'Ungültiger Fact verworfen',
          });
          continue;
        }
        facts.push(fact);
      }
      for (const message of result.errors ?? []) {
        warnings.push({ pluginId: plugin.descriptor.id, phase: 'scan', message });
      }
    } catch (error) {
      warnings.push({
        pluginId: plugin.descriptor.id,
        phase: 'scan',
        message: error instanceof Error ? error.message : 'Scan fehlgeschlagen',
      });
    }
  }

  return { facts, warnings };
}

export async function runPluginTransforms(
  registry: PluginRegistry,
  graph: KnowledgeGraph,
  enabledIds?: string[],
): Promise<{ graph: KnowledgeGraph; warnings: PluginLifecycleWarning[] }> {
  const warnings: PluginLifecycleWarning[] = [];
  let current = graph;

  for (const plugin of registry.listPlugins()) {
    if (!shouldRunPlugin(plugin, enabledIds) || !plugin.transform) continue;
    if (!plugin.descriptor.capabilities.includes('transform')) continue;

    const compat = compatibilityWarning(plugin);
    if (compat) {
      warnings.push(compat);
      continue;
    }

    try {
      const next = await plugin.transform(current);
      if (next instanceof KnowledgeGraph) current = next;
    } catch (error) {
      warnings.push({
        pluginId: plugin.descriptor.id,
        phase: 'transform',
        message: error instanceof Error ? error.message : 'Transform fehlgeschlagen',
      });
    }
  }

  return { graph: current, warnings };
}

export async function runPluginCleanup(
  registry: PluginRegistry,
  enabledIds?: string[],
): Promise<PluginLifecycleWarning[]> {
  const warnings: PluginLifecycleWarning[] = [];
  for (const plugin of registry.listPlugins()) {
    if (!shouldRunPlugin(plugin, enabledIds) || !plugin.cleanup) continue;
    try {
      await plugin.cleanup();
    } catch (error) {
      warnings.push({
        pluginId: plugin.descriptor.id,
        phase: 'cleanup',
        message: error instanceof Error ? error.message : 'Cleanup fehlgeschlagen',
      });
    }
  }
  return warnings;
}
