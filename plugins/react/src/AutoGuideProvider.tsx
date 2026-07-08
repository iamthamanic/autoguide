/**
 * @autoguide/react — root provider for host applications.
 */

import type { ReactNode } from 'react';
import { useCallback, useState } from 'react';
import type { Fact, FlowRecord, PageRecord, VisibilityMode, Tour } from '@autoguide/core';
import { AutoGuideContext, type DocElementRegistration } from './context.js';

export interface AutoGuideProviderProps {
  appId: string;
  userRole?: string;
  mode?: VisibilityMode;
  route?: string;
  facts?: Fact[];
  pages?: PageRecord[];
  flows?: FlowRecord[];
  tours?: Tour[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  children: ReactNode;
}

export function AutoGuideProvider({
  appId,
  userRole,
  mode = 'development',
  route = typeof window !== 'undefined' ? window.location.pathname : '/',
  facts = [],
  pages = [],
  flows = [],
  tours = [],
  loading = false,
  error = null,
  onRetry,
  children,
}: AutoGuideProviderProps) {
  const [docElements, setDocElements] = useState<DocElementRegistration[]>([]);
  const registerDocElement = useCallback((entry: DocElementRegistration) => {
    setDocElements((prev) => {
      const index = prev.findIndex((item) => item.id === entry.id);
      if (index === -1) return [...prev, entry];
      const next = [...prev];
      next[index] = entry;
      return next;
    });
  }, []);

  return (
    <AutoGuideContext.Provider
      value={{
        appId,
        userRole,
        mode,
        route,
        facts,
        pages,
        flows,
        tours,
        docElements,
        registerDocElement,
        loading,
        error,
        onRetry,
      }}
    >
      {children}
    </AutoGuideContext.Provider>
  );
}
