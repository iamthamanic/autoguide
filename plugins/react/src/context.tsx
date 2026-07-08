/**
 * @autoguide/react — React context for AutoGuide runtime.
 */

import { createContext, useContext } from 'react';
import type { Fact, FlowRecord, PageRecord, VisibilityMode, Tour } from '@autoguide/core';

export interface AutoGuideContextValue {
  appId: string;
  userRole?: string;
  mode: VisibilityMode;
  route: string;
  facts: Fact[];
  pages: PageRecord[];
  flows: FlowRecord[];
  tours?: Tour[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export const AutoGuideContext = createContext<AutoGuideContextValue | null>(null);

export function useAutoGuide(): AutoGuideContextValue {
  const ctx = useContext(AutoGuideContext);
  if (!ctx) {
    return { appId: 'unknown', mode: 'development', route: '/', facts: [], pages: [], flows: [], tours: [] };
  }
  return ctx;
}
