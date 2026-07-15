/**
 * @iamthamanic/autoguide-ui — design tokens from docs/UI_STYLEGUIDE.md (framework-agnostic).
 */

export const AG_DESIGN_TOKENS = {
  primary: '#1d4ed8',
  primarySoft: '#eff6ff',
  surface: '#ffffff',
  surfaceMuted: '#f1f5f9',
  surfaceGlass: 'rgba(255, 255, 255, 0.86)',
  border: 'rgba(15, 23, 42, 0.08)',
  borderStrong: 'rgba(15, 23, 42, 0.12)',
  text: '#0f172a',
  textMuted: '#64748b',
  warning: '#b45309',
  success: '#15803d',
  radius: '12px',
  radiusLg: '20px',
  shadow: '0 4px 24px rgba(15, 23, 42, 0.08)',
  shadowDock:
    '0 24px 64px rgba(15, 23, 42, 0.14), 0 0 0 1px rgba(15, 23, 42, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.65)',
  shadowPanel:
    '0 32px 80px rgba(15, 23, 42, 0.16), 0 0 0 1px rgba(15, 23, 42, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.7)',
  fontUi:
    'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
} as const;

export type AgCssVar =
  | '--ag-primary'
  | '--ag-primary-soft'
  | '--ag-surface'
  | '--ag-surface-muted'
  | '--ag-surface-glass'
  | '--ag-border'
  | '--ag-border-strong'
  | '--ag-text'
  | '--ag-text-muted'
  | '--ag-warning'
  | '--ag-success'
  | '--ag-radius'
  | '--ag-radius-lg'
  | '--ag-shadow'
  | '--ag-shadow-dock'
  | '--ag-shadow-panel'
  | '--ag-font-ui';

/** Inline style map for framework adapters (React `style`, Vue `style`, etc.). */
export function agTokenCssVars(): Record<string, string> {
  return {
    '--ag-primary': AG_DESIGN_TOKENS.primary,
    '--ag-primary-soft': AG_DESIGN_TOKENS.primarySoft,
    '--ag-surface': AG_DESIGN_TOKENS.surface,
    '--ag-surface-muted': AG_DESIGN_TOKENS.surfaceMuted,
    '--ag-surface-glass': AG_DESIGN_TOKENS.surfaceGlass,
    '--ag-border': AG_DESIGN_TOKENS.border,
    '--ag-border-strong': AG_DESIGN_TOKENS.borderStrong,
    '--ag-text': AG_DESIGN_TOKENS.text,
    '--ag-text-muted': AG_DESIGN_TOKENS.textMuted,
    '--ag-warning': AG_DESIGN_TOKENS.warning,
    '--ag-success': AG_DESIGN_TOKENS.success,
    '--ag-radius': AG_DESIGN_TOKENS.radius,
    '--ag-radius-lg': AG_DESIGN_TOKENS.radiusLg,
    '--ag-shadow': AG_DESIGN_TOKENS.shadow,
    '--ag-shadow-dock': AG_DESIGN_TOKENS.shadowDock,
    '--ag-shadow-panel': AG_DESIGN_TOKENS.shadowPanel,
    '--ag-font-ui': AG_DESIGN_TOKENS.fontUi,
  };
}
