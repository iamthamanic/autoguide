/**
 * @iamthamanic/autoguide-scanner — built-in source scanner plugin registration.
 */

import type { AutoGuidePlugin } from '@iamthamanic/autoguide-core';

export const sourceScannerPlugin: AutoGuidePlugin = {
  descriptor: {
    id: 'builtin-source-scanner',
    version: '0.1.0',
    kind: 'scanner',
    autoguideVersion: '^0.1.0',
    capabilities: ['setup'],
    description: 'Static TS/TSX source scanner',
  },
};
