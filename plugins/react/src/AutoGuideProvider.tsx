/**
 * @autoguide/react — root provider for host applications.
 */

import type { ReactNode } from 'react';
import type { Fact, VisibilityMode } from '@autoguide/core';
import { AutoGuideContext } from './context.js';

export interface AutoGuideProviderProps {
  appId: string;
  userRole?: string;
  mode?: VisibilityMode;
  facts?: Fact[];
  children: ReactNode;
}

export function AutoGuideProvider({
  appId,
  userRole,
  mode = 'development',
  facts = [],
  children,
}: AutoGuideProviderProps) {
  return (
    <AutoGuideContext.Provider value={{ appId, userRole, mode, facts }}>
      {children}
    </AutoGuideContext.Provider>
  );
}
