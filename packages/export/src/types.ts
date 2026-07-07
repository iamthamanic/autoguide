/**
 * @autoguide/export — shared export options.
 */

import type { VisibilityMode } from '@autoguide/core';

export interface ExportRenderOptions {
  mode: VisibilityMode;
  exportedAt?: string;
}
