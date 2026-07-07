/**
 * @autoguide/svelte — Svelte context for AutoGuide runtime.
 */

import { getContext } from 'svelte';
import type { Fact, FlowRecord, PageRecord, VisibilityMode } from '@autoguide/core';

export const AUTO_GUIDE_KEY = Symbol('autoguide');

export interface AutoGuideContextValue {
  appId: string;
  userRole?: string;
  mode: VisibilityMode;
  route: string;
  facts: Fact[];
  pages: PageRecord[];
  flows: FlowRecord[];
}

const fallback: AutoGuideContextValue = {
  appId: 'unknown',
  mode: 'development',
  route: '/',
  facts: [],
  pages: [],
  flows: [],
};

export function useAutoGuide(): AutoGuideContextValue {
  return getContext<AutoGuideContextValue>(AUTO_GUIDE_KEY) ?? fallback;
}
