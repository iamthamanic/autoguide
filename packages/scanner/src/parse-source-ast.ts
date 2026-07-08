/**
 * @autoguide/scanner — TypeScript AST extraction for routes, JSX, handlers, data-doc.
 */

import ts from 'typescript';
import type { RouteCandidate, SourceElementFact } from './types.js';

export interface AstExtractResult {
  routes: RouteCandidate[];
  elements: SourceElementFact[];
}

function scriptKind(filePath: string): ts.ScriptKind {
  if (filePath.endsWith('.tsx')) return ts.ScriptKind.TSX;
  if (filePath.endsWith('.jsx')) return ts.ScriptKind.JSX;
  return ts.ScriptKind.TS;
}

function lineOf(sourceFile: ts.SourceFile, node: ts.Node): number {
  return sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;
}

function jsxTagName(name: ts.JsxTagNameExpression): string | undefined {
  if (ts.isIdentifier(name)) return name.text;
  if (ts.isPropertyAccessExpression(name)) return name.name.text;
  return undefined;
}

function stringFromExpression(expr: ts.Expression | undefined): string | undefined {
  if (!expr) return undefined;
  if (ts.isStringLiteral(expr) || ts.isNoSubstitutionTemplateLiteral(expr)) return expr.text;
  return undefined;
}

function handlerFromExpression(expr: ts.Expression | undefined): string | undefined {
  if (!expr) return undefined;
  if (ts.isIdentifier(expr)) return expr.text;
  if (ts.isPropertyAccessExpression(expr)) return expr.name.text;
  return undefined;
}

function collectFunctionSymbols(sourceFile: ts.SourceFile): Map<string, number> {
  const symbols = new Map<string, number>();

  const register = (name: string | undefined, node: ts.Node) => {
    if (!name) return;
    if (!symbols.has(name)) symbols.set(name, lineOf(sourceFile, node));
  };

  const visit = (node: ts.Node) => {
    if (ts.isFunctionDeclaration(node)) register(node.name?.text, node);
    if (ts.isVariableStatement(node)) {
      for (const decl of node.declarationList.declarations) {
        if (ts.isIdentifier(decl.name) && decl.initializer) {
          if (
            ts.isArrowFunction(decl.initializer) ||
            ts.isFunctionExpression(decl.initializer)
          ) {
            register(decl.name.text, decl);
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return symbols;
}

function jsxTextContent(element: ts.JsxElement): string {
  return element.children
    .filter(ts.isJsxText)
    .map((child) => child.text.trim())
    .filter(Boolean)
    .join(' ');
}

function processJsxAttributes(
  filePath: string,
  sourceFile: ts.SourceFile,
  tag: string | undefined,
  attributes: ts.JsxAttributes,
  functionSymbols: Map<string, number>,
  elements: SourceElementFact[],
  routes: RouteCandidate[],
  jsxElement?: ts.JsxElement,
): void {
  let ariaLabel: string | undefined;
  let handlerName: string | undefined;
  let handlerLine: number | undefined;
  const dataDoc: Array<{ key: string; value?: string }> = [];

  for (const prop of attributes.properties) {
    if (!ts.isJsxAttribute(prop)) continue;
    const attrName = prop.name.getText(sourceFile);
    const init = prop.initializer;

    if (attrName === 'path' && tag === 'Route') {
      const route = stringFromExpression(init as ts.Expression);
      if (route) routes.push({ route, filePath });
    }

    if (attrName === 'aria-label') {
      ariaLabel = stringFromExpression(init as ts.Expression);
    }

    if (/^on(Click|Submit|Change)$/i.test(attrName) && init) {
      const name = handlerFromExpression(
        ts.isJsxExpression(init) ? init.expression : (init as ts.Expression),
      );
      if (name) {
        handlerName = name;
        handlerLine = functionSymbols.get(name);
      }
    }

    if (attrName.startsWith('data-doc-')) {
      const key = attrName.slice('data-doc-'.length);
      const value = init
        ? stringFromExpression(ts.isStringLiteral(init) ? init : (init as ts.Expression))
        : undefined;
      dataDoc.push({ key, value });
    }
  }

  for (const doc of dataDoc) {
    elements.push({
      filePath,
      dataDocKey: doc.key,
      dataDocValue: doc.value,
      line: lineOf(sourceFile, attributes),
    });
  }

  if (handlerName) {
    elements.push({
      filePath,
      handlerName,
      handlerDeclarationLine: handlerLine,
      line: lineOf(sourceFile, attributes),
    });
  }

  if (tag === 'button') {
    const buttonLabel =
      ariaLabel ?? (jsxElement ? jsxTextContent(jsxElement) : undefined);
    const hasMeaningfulText = Boolean(buttonLabel && /[a-zA-ZäöüÄÖÜß]{2,}/.test(buttonLabel));
    if (!ariaLabel && !hasMeaningfulText) {
      elements.push({
        filePath,
        missingAriaLabel: true,
        line: lineOf(sourceFile, attributes),
      });
    } else if (buttonLabel) {
      elements.push({
        filePath,
        buttonLabel,
        line: lineOf(sourceFile, attributes),
      });
    }
  }
}

function visitObjectLiteralRoutes(
  filePath: string,
  node: ts.ObjectLiteralExpression,
  routes: RouteCandidate[],
): void {
  for (const prop of node.properties) {
    if (!ts.isPropertyAssignment(prop)) continue;
    const key = prop.name.getText();
    if (key !== 'path') continue;
    const route = stringFromExpression(prop.initializer);
    if (route) routes.push({ route, filePath });
  }
}

export function extractFromAst(filePath: string, content: string): AstExtractResult {
  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true,
    scriptKind(filePath),
  );

  const routes: RouteCandidate[] = [];
  const elements: SourceElementFact[] = [];
  const functionSymbols = collectFunctionSymbols(sourceFile);

  const visit = (node: ts.Node) => {
    if (ts.isJsxSelfClosingElement(node)) {
      processJsxAttributes(
        filePath,
        sourceFile,
        jsxTagName(node.tagName),
        node.attributes,
        functionSymbols,
        elements,
        routes,
      );
    }

    if (ts.isJsxElement(node)) {
      processJsxAttributes(
        filePath,
        sourceFile,
        jsxTagName(node.openingElement.tagName),
        node.openingElement.attributes,
        functionSymbols,
        elements,
        routes,
        node,
      );
    }

    if (ts.isObjectLiteralExpression(node)) {
      visitObjectLiteralRoutes(filePath, node, routes);
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);

  return { routes, elements };
}

export function extractComponentNameFromAst(filePath: string, content: string): string | undefined {
  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true,
    scriptKind(filePath),
  );
  let name: string | undefined;
  ts.forEachChild(sourceFile, (node) => {
    if (ts.isFunctionDeclaration(node) && node.name) name = node.name.text;
    if (ts.isVariableStatement(node)) {
      const decl = node.declarationList.declarations[0];
      if (decl && ts.isIdentifier(decl.name)) name = decl.name.text;
    }
  });
  return name;
}
