/**
 * @autoguide/scanner — built-in source scanner plugin registration.
 */

import type { AutoGuidePlugin } from '@autoguide/core';

export const sourceScannerPlugin: AutoGuidePlugin = {
  descriptor: {
    id: 'builtin-source-scanner',
    version: '0.1.0',
    kind: 'scanner',
    description: 'Static TS/TSX source scanner',
  },
};
