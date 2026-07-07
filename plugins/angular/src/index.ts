/**
 * @autoguide/angular — public exports.
 * API parity with @autoguide/react: AutoGuideProvider, AutoGuideWidget,
 * InspectorOverlay, useAutoGuide (Angular service inject).
 */

export { AutoGuideProviderComponent as AutoGuideProvider } from './autoguide-provider.component.js';
export type { AutoGuideProviderProps } from './autoguide-provider.component.js';
export { AutoGuideWidgetComponent as AutoGuideWidget } from './autoguide-widget.component.js';
export { InspectorOverlayComponent as InspectorOverlay } from './inspector-overlay.component.js';
export { AutoGuideContextService, useAutoGuide } from './context.js';
