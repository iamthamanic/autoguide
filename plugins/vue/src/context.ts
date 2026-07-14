/**
 * @iamthamanic/autoguide-vue — Vue provide/inject context for AutoGuide runtime.
 */

import { inject, type InjectionKey } from 'vue';
import type { Fact, FlowRecord, PageRecord, VisibilityMode } from '@iamthamanic/autoguide-core';

export interface AutoGuideContextValue {
  appId: string;
  userRole?: string;
  mode: VisibilityMode;
  route: string;
  facts: Fact[];
  pages: PageRecord[];
  flows: FlowRecord[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export const AUTO_GUIDE_KEY: InjectionKey<AutoGuideContextValue> = Symbol('autoguide');

const fallback: AutoGuideContextValue = {
  appId: 'unknown',
  mode: 'development',
  route: '/',
  facts: [],
  pages: [],
  flows: [],
};

export function useAutoGuide(): AutoGuideContextValue {
  return inject(AUTO_GUIDE_KEY, fallback);
}
