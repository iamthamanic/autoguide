/**
 * @autoguide/react — root provider for host applications.
 */

import type { ReactNode } from 'react';
import type { VisibilityMode } from '@autoguide/core';
import { AutoGuideContext } from './context.js';

export interface AutoGuideProviderProps {
  appId: string;
  userRole?: string;
  mode?: VisibilityMode;
  children: ReactNode;
}

export function AutoGuideProvider({
  appId,
  userRole,
  mode = 'development',
  children,
}: AutoGuideProviderProps) {
  return (
    <AutoGuideContext.Provider value={{ appId, userRole, mode }}>
      {children}
    </AutoGuideContext.Provider>
  );
}
