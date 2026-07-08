import { describe, expect, it } from 'vitest';
import { createPluginRegistry, type AutoGuidePlugin } from './registry.js';

const stubPlugin: AutoGuidePlugin = {
  descriptor: {
    id: 'stub-scanner',
    version: '0.1.0',
    kind: 'scanner',
    autoguideVersion: '^0.1.0',
    capabilities: ['scan'],
    description: 'Example scanner plugin',
  },
};

describe('PluginRegistry', () => {
  it('registers and lists plugins by kind', () => {
    const registry = createPluginRegistry([stubPlugin]);
    expect(registry.list('scanner')).toHaveLength(1);
    expect(registry.get('stub-scanner')?.descriptor.version).toBe('0.1.0');
  });

  it('documents capabilities for doctor output', () => {
    const registry = createPluginRegistry([stubPlugin]);
    const docs = registry.describeCapabilities();
    expect(docs[0]?.capabilities).toContain('scan');
    expect(docs[0]?.capabilityDocs[0]).toContain('Facts');
  });

  it('rejects duplicate plugin ids', () => {
    const registry = createPluginRegistry();
    registry.register(stubPlugin);
    expect(() => registry.register(stubPlugin)).toThrow(/bereits registriert/);
  });
});
