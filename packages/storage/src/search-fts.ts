/**
 * @autoguide/storage — helpers for building FTS rows from knowledge records.
 */

import type { FlowRecord, PageRecord } from '@autoguide/core';
import { redactString } from '@autoguide/core';

export interface SearchFtsRow {
  docId: string;
  kind: 'page' | 'flow';
  title: string;
  body: string;
  roleFilter: string;
  status: string;
}

export function encodeRoleFilter(roleIds: string[]): string {
  if (roleIds.length === 0) return '';
  return `,${roleIds.join(',')},`;
}

export function matchesRoleFilter(roleFilter: string, userRole?: string): boolean {
  if (!roleFilter) return true;
  if (!userRole) return true;
  return roleFilter.includes(`,${userRole},`);
}

export function pageToSearchFtsRow(page: PageRecord): SearchFtsRow {
  const body = [page.route, page.description ?? ''].filter(Boolean).join(' ');
  return {
    docId: page.id,
    kind: 'page',
    title: redactString(page.title),
    body: redactString(body),
    roleFilter: encodeRoleFilter(page.roleIds),
    status: page.status,
  };
}

export function flowToSearchFtsRow(flow: FlowRecord): SearchFtsRow {
  const stepText = flow.steps
    .map((step) => [step.title, step.description ?? ''].filter(Boolean).join(' '))
    .join(' ');
  const body = [flow.description ?? '', stepText].filter(Boolean).join(' ');
  return {
    docId: flow.id,
    kind: 'flow',
    title: redactString(flow.title),
    body: redactString(body),
    roleFilter: encodeRoleFilter(flow.roleIds),
    status: flow.status,
  };
}

export function buildSearchFtsRows(pages: PageRecord[], flows: FlowRecord[]): SearchFtsRow[] {
  return [...pages.map(pageToSearchFtsRow), ...flows.map(flowToSearchFtsRow)];
}

export function toFtsMatchQuery(raw: string): string {
  const tokens = raw
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => token.replace(/"/g, '""'));
  if (tokens.length === 0) return '';
  return tokens.map((token) => `"${token}"*`).join(' OR ');
}
