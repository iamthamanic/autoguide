/**
 * @iamthamanic/autoguide-angular — public exports.
 * API parity with @iamthamanic/autoguide-react: AutoGuideProvider, AutoGuideWidget,
 * InspectorOverlay, useAutoGuide (Angular service inject).
 */

export { AutoGuideProviderComponent as AutoGuideProvider } from './autoguide-provider.component.js';
export type { AutoGuideProviderProps } from './autoguide-provider.component.js';
export { AutoGuideWidgetComponent as AutoGuideWidget } from './autoguide-widget.component.js';
export { ReviewBadgeComponent as ReviewBadge } from './review-badge.component.js';
export { FlowStepListComponent as FlowStepList } from './flow-step-list.component.js';
export { InspectorOverlayComponent as InspectorOverlay } from './inspector-overlay.component.js';
export { AutoGuideContextService, useAutoGuide } from './context.js';
