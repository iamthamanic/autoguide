import { describe, expect, it } from 'vitest';
import { extractElementsFromText, extractRoutesFromText } from './parse-source.js';
import { extractFromAst } from './parse-source-ast.js';

describe('@autoguide/scanner', () => {
  it('extracts react-router paths via AST', () => {
    const content = `<Route path="/settings" element={<Settings />} />`;
    const routes = extractRoutesFromText('App.tsx', content);
    expect(routes[0]?.route).toBe('/settings');
  });

  it('extracts data-doc attributes and handlers via AST', () => {
    const content = `<button data-doc-action="save" onClick={handleSave}>Save</button>`;
    const elements = extractElementsFromText('Page.tsx', content);
    expect(elements.some((e) => e.dataDocKey === 'action')).toBe(true);
    expect(elements.some((e) => e.handlerName === 'handleSave')).toBe(true);
    expect(elements.some((e) => e.buttonLabel === 'Save')).toBe(true);
  });

  it('detects icon-only buttons without aria-label via AST', () => {
    const content = `<button onClick={handleClick}>✓</button>`;
    const elements = extractElementsFromText('Page.tsx', content);
    expect(elements.some((e) => e.missingAriaLabel)).toBe(true);
  });

  it('extracts DocElement props via AST', () => {
    const content = `
import { DocElement } from '@autoguide/react';
export function Page() {
  return (
    <DocElement id="vacation.approve" title="Genehmigen" description="Genehmigt Antrag" roles={['HR', 'Teamlead']}>
      <button>OK</button>
    </DocElement>
  );
}`;
    const { elements } = extractFromAst('Page.tsx', content);
    expect(elements.find((e) => e.dataDocKey === 'id')?.dataDocValue).toBe('vacation.approve');
    expect(elements.find((e) => e.dataDocKey === 'title')?.dataDocValue).toBe('Genehmigen');
    expect(elements.find((e) => e.dataDocKey === 'description')?.dataDocValue).toBe('Genehmigt Antrag');
    expect(elements.find((e) => e.dataDocKey === 'roles')?.dataDocValue).toBe('HR,Teamlead');
  });

  it('links onClick handler to function declaration line in same file', () => {
    const content = `
function approveVacationRequest() {
  return true;
}
export function Page() {
  return <button onClick={approveVacationRequest}>Approve</button>;
}`;
    const { elements } = extractFromAst('Page.tsx', content);
    const handler = elements.find((e) => e.handlerName === 'approveVacationRequest');
    expect(handler?.handlerDeclarationLine).toBe(2);
  });

  it('extracts nested component JSX and object literal routes', () => {
    const content = `
const routes = [{ path: '/dashboard', element: <Dashboard /> }];
function Dashboard() {
  return (
    <section>
      <button data-doc-id="save" aria-label="Speichern" onClick={onSave} />
    </section>
  );
}
function onSave() {}`;
    const { routes, elements } = extractFromAst('App.tsx', content);
    expect(routes.some((r) => r.route === '/dashboard')).toBe(true);
    expect(elements.some((e) => e.dataDocKey === 'id')).toBe(true);
    expect(elements.some((e) => e.handlerName === 'onSave')).toBe(true);
  });
});
