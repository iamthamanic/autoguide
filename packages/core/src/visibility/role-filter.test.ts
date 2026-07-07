import { describe, expect, it } from 'vitest';
import type { Fact } from '../types/fact.js';
import { filterByRole, filterFactsByRole, isVisibleForRole } from './role-filter.js';

const adminFlow = { id: 'f1', title: 'Admin', roleIds: ['HR-Admin'] };
const userFlow = { id: 'f2', title: 'User', roleIds: ['Mitarbeiter'] };
const publicFlow = { id: 'f3', title: 'Public', roleIds: [] as string[] };

describe('role filter', () => {
  it('shows all when userRole is missing', () => {
    expect(isVisibleForRole(['HR-Admin'])).toBe(true);
    expect(filterByRole([adminFlow, userFlow])).toHaveLength(2);
  });

  it('filters by userRole', () => {
    expect(filterByRole([adminFlow, userFlow, publicFlow], 'HR-Admin')).toEqual([
      adminFlow,
      publicFlow,
    ]);
    expect(filterByRole([adminFlow, userFlow], 'Mitarbeiter')).toEqual([userFlow]);
  });

  it('filters facts with optional roleIds', () => {
    const facts: Fact[] = [
      {
        id: 'a',
        entityId: 'e',
        key: 'action',
        value: 'Admin',
        roleIds: ['HR-Admin'],
        status: 'verified',
        reviewStatus: 'approved',
        confidence: 1,
        provenance: [],
        createdAt: '',
        updatedAt: '',
      },
      {
        id: 'b',
        entityId: 'e',
        key: 'action',
        value: 'All',
        status: 'verified',
        reviewStatus: 'approved',
        confidence: 1,
        provenance: [],
        createdAt: '',
        updatedAt: '',
      },
    ];
    expect(filterFactsByRole(facts, 'Mitarbeiter').map((f) => f.id)).toEqual(['b']);
  });
});
