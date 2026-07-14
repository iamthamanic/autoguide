/**
 * @iamthamanic/autoguide-export — shared export options.
 */

import type { VisibilityMode } from '@iamthamanic/autoguide-core';

export interface ExportRenderOptions {
  mode: VisibilityMode;
  userRole?: string;
  exportedAt?: string;
}
