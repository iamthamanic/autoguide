/**
 * @autoguide/react — React context for AutoGuide runtime.
 */

import { createContext, useContext } from 'react';
import type { Fact, VisibilityMode } from '@autoguide/core';

export interface AutoGuideContextValue {
  appId: string;
  userRole?: string;
  mode: VisibilityMode;
  facts: Fact[];
}

export const AutoGuideContext = createContext<AutoGuideContextValue | null>(null);

export function useAutoGuide(): AutoGuideContextValue {
  const ctx = useContext(AutoGuideContext);
  if (!ctx) {
    return { appId: 'unknown', mode: 'development', facts: [] };
  }
  return ctx;
}
