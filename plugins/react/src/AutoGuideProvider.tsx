/**
 * @autoguide/react — root provider for host applications.
 */

import type { ReactNode } from 'react';
import type { Fact, FlowRecord, PageRecord, VisibilityMode } from '@autoguide/core';
import { AutoGuideContext } from './context.js';

export interface AutoGuideProviderProps {
  appId: string;
  userRole?: string;
  mode?: VisibilityMode;
  route?: string;
  facts?: Fact[];
  pages?: PageRecord[];
  flows?: FlowRecord[];
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
  children,
}: AutoGuideProviderProps) {
  return (
    <AutoGuideContext.Provider
      value={{ appId, userRole, mode, route, facts, pages, flows }}
    >
      {children}
    </AutoGuideContext.Provider>
  );
}
