/**
 * @autoguide/scanner — extract routes, handlers, and data-doc metadata from source.
 */

import type { RouteCandidate, SourceElementFact, SourceScanResult } from './types.js';
import { extractComponentNameFromAst, extractFromAst } from './parse-source-ast.js';
import { readSourceFile, walkSourceFiles } from './walker.js';

function isAstSourceFile(filePath: string): boolean {
  return /\.(tsx|jsx|ts)$/i.test(filePath);
}

export function extractRoutesFromText(filePath: string, content: string): RouteCandidate[] {
  if (!isAstSourceFile(filePath)) return [];
  return extractFromAst(filePath, content).routes;
}

export function extractElementsFromText(filePath: string, content: string): SourceElementFact[] {
  if (!isAstSourceFile(filePath)) return [];
  return extractFromAst(filePath, content).elements;
}

export function extractComponentName(filePath: string, content: string): string | undefined {
  if (!isAstSourceFile(filePath)) return undefined;
  return extractComponentNameFromAst(filePath, content);
}

export async function scanSourceProject(rootDir: string): Promise<SourceScanResult> {
  const files = await walkSourceFiles(rootDir);
  const routes: RouteCandidate[] = [];
  const elements: SourceElementFact[] = [];

  for (const filePath of files) {
    const content = await readSourceFile(filePath);
    if (!isAstSourceFile(filePath)) continue;

    const ast = extractFromAst(filePath, content);
    routes.push(...ast.routes);
    const componentName = extractComponentNameFromAst(filePath, content);
    for (const element of ast.elements) {
      elements.push({ ...element, componentName });
    }
  }

  return { routes, elements };
}

// ponytail: regex fallback removed — AST is the only extraction path for TS/TSX
