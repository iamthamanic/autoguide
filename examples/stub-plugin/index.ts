/**
 * Example stub plugin for third-party scanner integration demos.
 */

import type { AutoGuidePlugin } from '@autoguide/core';

export const exampleStubPlugin: AutoGuidePlugin = {
  descriptor: {
    id: 'example-stub-scanner',
    version: '0.1.0',
    kind: 'scanner',
    description: 'No-op scanner plugin used in examples',
  },
};
