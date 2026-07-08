/**
 * @autoguide/react — React context for AutoGuide runtime.
 */

import { createContext, useContext } from 'react';
import type { Fact, FlowRecord, PageRecord, VisibilityMode, Tour } from '@autoguide/core';

export interface DocElementRegistration {
  id: string;
  title: string;
  description?: string;
  roles?: string[];
}

export interface AutoGuideContextValue {
  appId: string;
  userRole?: string;
  mode: VisibilityMode;
  route: string;
  facts: Fact[];
  pages: PageRecord[];
  flows: FlowRecord[];
  tours?: Tour[];
  docElements: DocElementRegistration[];
  registerDocElement: (entry: DocElementRegistration) => void;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export const AutoGuideContext = createContext<AutoGuideContextValue | null>(null);

const noopRegister = () => {};

export function useAutoGuide(): AutoGuideContextValue {
  const ctx = useContext(AutoGuideContext);
  if (!ctx) {
    return {
      appId: 'unknown',
      mode: 'development',
      route: '/',
      facts: [],
      pages: [],
      flows: [],
      tours: [],
      docElements: [],
      registerDocElement: noopRegister,
    };
  }
  return ctx;
}
