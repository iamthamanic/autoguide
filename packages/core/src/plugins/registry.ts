/**
 * @autoguide/core — plugin registry for scanners, adapters, and AI hooks.
 */

export type PluginKind = 'scanner' | 'adapter' | 'ai' | 'export';

export interface PluginDescriptor {
  id: string;
  version: string;
  kind: PluginKind;
  description?: string;
}

export interface AutoGuidePlugin {
  descriptor: PluginDescriptor;
  activate?(context: PluginRegistry): void;
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

  get(id: string): AutoGuidePlugin | undefined {
    return this.plugins.get(id);
  }
}

export function createPluginRegistry(plugins: AutoGuidePlugin[] = []): PluginRegistry {
  const registry = new PluginRegistry();
  for (const plugin of plugins) registry.register(plugin);
  return registry;
}
