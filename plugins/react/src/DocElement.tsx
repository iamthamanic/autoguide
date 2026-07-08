/**
 * @autoguide/react — DocElement wrapper for explicit documentation metadata.
 * Location: plugins/react/src/DocElement.tsx
 */

import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  type ReactElement,
  type ReactNode,
} from 'react';
import { useAutoGuide } from './context.js';

export interface DocElementProps {
  id: string;
  title: string;
  description?: string;
  roles?: string[];
  children: ReactNode;
}

export function DocElement({ id, title, description, roles, children }: DocElementProps) {
  const { registerDocElement } = useAutoGuide();

  useEffect(() => {
    registerDocElement({ id, title, description, roles });
  }, [id, title, description, roles, registerDocElement]);

  const child = Children.only(children);
  if (!isValidElement(child)) return <>{children}</>;

  const rolesAttr = roles?.length ? roles.join(',') : undefined;
  return cloneElement(child as ReactElement<Record<string, unknown>>, {
    'data-doc-id': id,
    'data-doc-title': title,
    ...(description ? { 'data-doc-description': description } : {}),
    ...(rolesAttr ? { 'data-doc-roles': rolesAttr } : {}),
  });
}
