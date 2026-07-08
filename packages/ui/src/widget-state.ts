/**
 * @autoguide/ui — shared panel state types for widget shells.
 */

export type WidgetPanelState = 'loading' | 'empty' | 'error' | 'ready';

export interface WidgetPanelStatus {
  state: WidgetPanelState;
  message?: string;
}

export function resolveWidgetPanelStatus(input: {
  loading?: boolean;
  error?: string | null;
  hasContent: boolean;
}): WidgetPanelStatus {
  if (input.loading) return { state: 'loading' };
  if (input.error) return { state: 'error', message: input.error };
  if (!input.hasContent) return { state: 'empty' };
  return { state: 'ready' };
}
