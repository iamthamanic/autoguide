/**
 * @autoguide/vue — root provider for host applications.
 */

import { defineComponent, provide, type PropType } from 'vue';
import type { Fact, FlowRecord, PageRecord, VisibilityMode } from '@autoguide/core';
import { AUTO_GUIDE_KEY } from './context.js';

export const AutoGuideProvider = defineComponent({
  name: 'AutoGuideProvider',
  props: {
    appId: { type: String, required: true },
    userRole: { type: String, default: undefined },
    mode: { type: String as PropType<VisibilityMode>, default: 'development' },
    route: {
      type: String,
      default: () => (typeof window !== 'undefined' ? window.location.pathname : '/'),
    },
    facts: { type: Array as PropType<Fact[]>, default: () => [] },
    pages: { type: Array as PropType<PageRecord[]>, default: () => [] },
    flows: { type: Array as PropType<FlowRecord[]>, default: () => [] },
    loading: { type: Boolean, default: false },
    error: { type: String as PropType<string | null>, default: null },
    onRetry: { type: Function as PropType<() => void>, default: undefined },
  },
  setup(props, { slots }) {
    provide(AUTO_GUIDE_KEY, props);
    return () => slots.default?.();
  },
});

export type AutoGuideProviderProps = InstanceType<typeof AutoGuideProvider>['$props'];
