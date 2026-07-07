/**
 * @autoguide/vue — public exports.
 * API parity with @autoguide/react: AutoGuideProvider, AutoGuideWidget,
 * InspectorOverlay, useAutoGuide (Vue inject vs React context).
 */

export { AutoGuideProvider } from './AutoGuideProvider.js';
export type { AutoGuideProviderProps } from './AutoGuideProvider.js';
export { AutoGuideWidget } from './AutoGuideWidget.js';
export { InspectorOverlay } from './InspectorOverlay.js';
export { useAutoGuide } from './context.js';
