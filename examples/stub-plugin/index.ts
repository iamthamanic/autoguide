/**
 * Example stub plugin for third-party scanner integration demos.
 */

import type { AutoGuidePlugin, PluginScanContext, PluginScanResult } from '@iamthamanic/autoguide-core';

function buildStubFact(now: string) {
  return {
    id: 'plugin-stub-fact-1',
    entityId: 'plugin-stub-entity',
    key: 'plugin.note',
    value: 'Beispiel-Fact aus example-stub-scanner',
    status: 'verified' as const,
    reviewStatus: 'pending' as const,
    confidence: 0.75,
    provenance: [
      {
        source: 'plugin' as const,
        sourceId: 'example-stub-scanner',
        confidence: 0.75,
        observedAt: now,
      },
    ],
    createdAt: now,
    updatedAt: now,
  };
}

export const exampleStubPlugin: AutoGuidePlugin = {
  descriptor: {
    id: 'example-stub-scanner',
    version: '0.1.0',
    kind: 'scanner',
    autoguideVersion: '^0.1.0',
    capabilities: ['scan'],
    description: 'No-op scanner plugin used in examples',
  },
  scan(_context: PluginScanContext): PluginScanResult {
    const now = new Date().toISOString();
    return { facts: [buildStubFact(now)] };
  },
};

export default exampleStubPlugin;
