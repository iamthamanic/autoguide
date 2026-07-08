/**
 * @autoguide/ui — design tokens from docs/UI_STYLEGUIDE.md (framework-agnostic).
 */

export const AG_DESIGN_TOKENS = {
  primary: '#2563eb',
  surface: '#ffffff',
  surfaceMuted: '#f8fafc',
  border: '#e2e8f0',
  text: '#0f172a',
  textMuted: '#64748b',
  warning: '#d97706',
  success: '#16a34a',
  radius: '8px',
  shadow: '0 4px 24px rgba(0,0,0,0.12)',
} as const;

export type AgCssVar =
  | '--ag-primary'
  | '--ag-surface'
  | '--ag-surface-muted'
  | '--ag-border'
  | '--ag-text'
  | '--ag-text-muted'
  | '--ag-warning'
  | '--ag-success'
  | '--ag-radius'
  | '--ag-shadow';

/** Inline style map for framework adapters (React `style`, Vue `style`, etc.). */
export function agTokenCssVars(): Record<string, string> {
  return {
    '--ag-primary': AG_DESIGN_TOKENS.primary,
    '--ag-surface': AG_DESIGN_TOKENS.surface,
    '--ag-surface-muted': AG_DESIGN_TOKENS.surfaceMuted,
    '--ag-border': AG_DESIGN_TOKENS.border,
    '--ag-text': AG_DESIGN_TOKENS.text,
    '--ag-text-muted': AG_DESIGN_TOKENS.textMuted,
    '--ag-warning': AG_DESIGN_TOKENS.warning,
    '--ag-success': AG_DESIGN_TOKENS.success,
    '--ag-radius': AG_DESIGN_TOKENS.radius,
    '--ag-shadow': AG_DESIGN_TOKENS.shadow,
  };
}
