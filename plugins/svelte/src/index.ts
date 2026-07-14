/**
 * @iamthamanic/autoguide-svelte — public exports.
 * API parity with @iamthamanic/autoguide-react: AutoGuideProvider, AutoGuideWidget,
 * InspectorOverlay, useAutoGuide.
 */

export { default as AutoGuideProvider } from './AutoGuideProvider.svelte';
export { default as AutoGuideWidget } from './AutoGuideWidget.svelte';
export { default as ReviewBadge } from './ReviewBadge.svelte';
export { default as FlowStepList } from './FlowStepList.svelte';
export { default as InspectorOverlay } from './InspectorOverlay.svelte';
export { useAutoGuide } from './context.js';
export type { AutoGuideContextValue } from './context.js';
