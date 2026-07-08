/**
 * @autoguide/core — plugin registry for scanners, adapters, and AI hooks.
 */

import type { Fact } from '../types/fact.js';
import type { KnowledgeGraph } from '../graph/knowledge-graph.js';

export type PluginKind = 'scanner' | 'adapter' | 'ai' | 'export';

export type PluginCapability = 'setup' | 'scan' | 'transform' | 'export' | 'ai';

/** Human-readable capability registry for doctor/docs output. */
export const PLUGIN_CAPABILITY_DOCS: Record<PluginCapability, string> = {
  setup: 'Initialisierung vor dem Scan (Pfade, Hooks)',
  scan: 'Zusätzliche Facts aus benutzerdefinierten Quellen',
  transform: 'Knowledge-Graph nach dem Merge anpassen',
  export: 'Zusätzliche Export-Formate (geplant)',
  ai: 'AI-Provider-Erweiterungen (geplant)',
};

export interface PluginDescriptor {
  id: string;
  version: string;
  kind: PluginKind;
  /** Semver range compatible with @autoguide/core, e.g. ^0.1.0 */
  autoguideVersion: string;
  capabilities: PluginCapability[];
  description?: string;
}

export interface PluginSetupContext {
  cwd: string;
  outputDir: string;
  sourceDir: string;
  config: Record<string, unknown>;
}

export interface PluginScanContext extends PluginSetupContext {}

export interface PluginScanResult {
  facts: Fact[];
  errors?: string[];
}

export interface AutoGuidePlugin {
  descriptor: PluginDescriptor;
  activate?(context: PluginRegistry): void;
  setup?(context: PluginSetupContext): Promise<void> | void;
  scan?(context: PluginScanContext): Promise<PluginScanResult> | PluginScanResult;
  transform?(graph: KnowledgeGraph): Promise<KnowledgeGraph> | KnowledgeGraph;
  cleanup?(): Promise<void> | void;
}

export interface PluginCapabilityEntry {
  id: string;
  kind: PluginKind;
  version: string;
  autoguideVersion: string;
  capabilities: PluginCapability[];
  capabilityDocs: string[];
  description?: string;
}

export class PluginRegistry {
  private readonly plugins = new Map<string, AutoGuidePlugin>();

  register(plugin: AutoGuidePlugin): void {
    if (this.plugins.has(plugin.descriptor.id)) {
      throw new Error(`Plugin bereits registriert: ${plugin.descriptor.id}`);
    }
    this.plugins.set(plugin.descriptor.id, plugin);
    plugin.activate?.(this);
  }

  list(kind?: PluginKind): PluginDescriptor[] {
    const items = [...this.plugins.values()].map((plugin) => plugin.descriptor);
    return kind ? items.filter((item) => item.kind === kind) : items;
  }

  listPlugins(kind?: PluginKind): AutoGuidePlugin[] {
    const items = [...this.plugins.values()];
    return kind ? items.filter((plugin) => plugin.descriptor.kind === kind) : items;
  }

  describeCapabilities(): PluginCapabilityEntry[] {
    return this.list().map((descriptor) => ({
      id: descriptor.id,
      kind: descriptor.kind,
      version: descriptor.version,
      autoguideVersion: descriptor.autoguideVersion,
      capabilities: descriptor.capabilities,
      capabilityDocs: descriptor.capabilities.map((cap) => PLUGIN_CAPABILITY_DOCS[cap]),
      description: descriptor.description,
    }));
  }

  get(id: string): AutoGuidePlugin | undefined {
    return this.plugins.get(id);
  }
}

export function createPluginRegistry(plugins: AutoGuidePlugin[] = []): PluginRegistry {
  const registry = new PluginRegistry();
  for (const plugin of plugins) registry.register(plugin);
  return registry;
}
