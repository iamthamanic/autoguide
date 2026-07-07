/**
 * @autoguide/core — filter records and facts by user role.
 */

import type { Fact } from '../types/fact.js';

/** Empty roleIds = visible to all roles. Missing userRole = safe default (show all). */
export function isVisibleForRole(recordRoleIds: string[], userRole?: string): boolean {
  if (recordRoleIds.length === 0) return true;
  if (!userRole) return true;
  return recordRoleIds.includes(userRole);
}

export function filterByRole<T extends { roleIds: string[] }>(
  items: T[],
  userRole?: string,
): T[] {
  return items.filter((item) => isVisibleForRole(item.roleIds, userRole));
}

export function filterFactsByRole(facts: Fact[], userRole?: string): Fact[] {
  return facts.filter((fact) => isVisibleForRole(fact.roleIds ?? [], userRole));
}
