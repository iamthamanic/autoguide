/**
 * @autoguide/react — design tokens from docs/UI_STYLEGUIDE.md as CSS variables.
 */

import type { CSSProperties } from 'react';

export const AG_TOKEN_VARS: CSSProperties = {
  ['--ag-primary' as string]: '#2563eb',
  ['--ag-surface' as string]: '#ffffff',
  ['--ag-surface-muted' as string]: '#f8fafc',
  ['--ag-border' as string]: '#e2e8f0',
  ['--ag-text' as string]: '#0f172a',
  ['--ag-text-muted' as string]: '#64748b',
  ['--ag-warning' as string]: '#d97706',
  ['--ag-success' as string]: '#16a34a',
  ['--ag-radius' as string]: '8px',
  ['--ag-shadow' as string]: '0 4px 24px rgba(0,0,0,0.12)',
};
