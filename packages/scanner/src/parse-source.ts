/**
 * @autoguide/scanner — extract routes, handlers, and data-doc metadata from source.
 */

import ts from 'typescript';
import type { RouteCandidate, SourceElementFact, SourceScanResult } from './types.js';
import { readSourceFile, walkSourceFiles } from './walker.js';

const ROUTE_PATTERNS = [
  /path:\s*['"`]([^'"`]+)['"`]/g,
  /<Route[^>]*path=['"`]([^'"`]+)['"`]/g,
  /createBrowserRouter\(\s*\[\s*\{[^}]*path:\s*['"`]([^'"`]+)['"`]/g,
];

const DATA_DOC_PATTERN = /data-doc-([a-zA-Z0-9_-]+)=['"`]([^'"`]*)['"`]/g;
const HANDLER_PATTERN = /on(Click|Submit|Change)\s*=\s*\{?\s*([a-zA-Z0-9_$.]+)/g;
const BUTTON_PATTERN = /<button\b[^>]*>/gi;

export function extractRoutesFromText(filePath: string, content: string): RouteCandidate[] {
  const routes: RouteCandidate[] = [];
  for (const pattern of ROUTE_PATTERNS) {
    pattern.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(content)) !== null) {
      routes.push({ route: match[1] ?? '/', filePath });
    }
  }
  return routes;
}

export function extractElementsFromText(filePath: string, content: string): SourceElementFact[] {
  const elements: SourceElementFact[] = [];

  let match: RegExpExecArray | null;
  DATA_DOC_PATTERN.lastIndex = 0;
  while ((match = DATA_DOC_PATTERN.exec(content)) !== null) {
    elements.push({
      filePath,
      dataDocKey: match[1],
      dataDocValue: match[2],
      line: content.slice(0, match.index).split('\n').length,
    });
  }

  HANDLER_PATTERN.lastIndex = 0;
  while ((match = HANDLER_PATTERN.exec(content)) !== null) {
    elements.push({
      filePath,
      handlerName: match[2],
      line: content.slice(0, match.index).split('\n').length,
    });
  }

  BUTTON_PATTERN.lastIndex = 0;
  while ((match = BUTTON_PATTERN.exec(content)) !== null) {
    const tag = match[0] ?? '';
    const hasAria = /aria-label\s*=/.test(tag) || /aria-labelledby\s*=/.test(tag);
    const innerMatch = content.slice(match.index).match(/<button\b[^>]*>([\s\S]*?)<\/button>/i);
    const inner = innerMatch?.[1]?.trim() ?? '';
    const hasMeaningfulText = /[a-zA-ZäöüÄÖÜß]{2,}/.test(inner);
    if (!hasAria && !hasMeaningfulText) {
      elements.push({
        filePath,
        missingAriaLabel: true,
        line: content.slice(0, match.index).split('\n').length,
      });
    }
  }

  return elements;
}

export function extractComponentName(filePath: string, content: string): string | undefined {
  const source = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true, scriptKind(filePath));
  let name: string | undefined;
  ts.forEachChild(source, (node) => {
    if (ts.isFunctionDeclaration(node) && node.name) name = node.name.text;
    if (ts.isVariableStatement(node)) {
      const decl = node.declarationList.declarations[0];
      if (decl && ts.isIdentifier(decl.name)) name = decl.name.text;
    }
  });
  return name;
}

function scriptKind(filePath: string): ts.ScriptKind {
  return filePath.endsWith('.tsx') || filePath.endsWith('.jsx')
    ? ts.ScriptKind.TSX
    : ts.ScriptKind.TS;
}

export async function scanSourceProject(rootDir: string): Promise<SourceScanResult> {
  const files = await walkSourceFiles(rootDir);
  const routes: RouteCandidate[] = [];
  const elements: SourceElementFact[] = [];

  for (const filePath of files) {
    const content = await readSourceFile(filePath);
    routes.push(...extractRoutesFromText(filePath, content));
    const fileElements = extractElementsFromText(filePath, content);
    const componentName = extractComponentName(filePath, content);
    for (const element of fileElements) {
      elements.push({ ...element, componentName });
    }
  }

  return { routes, elements };
}
