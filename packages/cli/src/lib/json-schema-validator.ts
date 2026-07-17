/**
 * @iamthamanic/autoguide-cli — JSON Schema validation for .autoguide artifacts.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import type { ValidateFunction } from 'ajv';

export type ArtifactSchemaFile =
  | 'facts.schema.json'
  | 'pages.schema.json'
  | 'features.schema.json'
  | 'flows.schema.json'
  | 'confidence.schema.json';

export const ARTIFACT_SCHEMA_MAP: Record<string, ArtifactSchemaFile> = {
  'facts.json': 'facts.schema.json',
  'pages.json': 'pages.schema.json',
  'features.json': 'features.schema.json',
  'flows.json': 'flows.schema.json',
  'confidence.json': 'confidence.schema.json',
};

/** Resolve schemas next to `@iamthamanic/autoguide-core` (npm + monorepo). */
function resolveSchemaDir(): string {
  const coreEntry = fileURLToPath(import.meta.resolve('@iamthamanic/autoguide-core'));
  return join(dirname(coreEntry), '..', 'schemas');
}

const SCHEMA_DIR = resolveSchemaDir();

let ajvInstance: Ajv2020 | null = null;
const validators = new Map<string, ValidateFunction>();

function loadAjv(): Ajv2020 {
  if (ajvInstance) return ajvInstance;
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  const files = readdirSync(SCHEMA_DIR)
    .filter((file) => file.endsWith('.schema.json'))
    .sort((a, b) => {
      if (a === 'shared.schema.json') return -1;
      if (b === 'shared.schema.json') return 1;
      return a.localeCompare(b);
    });
  for (const file of files) {
    const schema = JSON.parse(readFileSync(join(SCHEMA_DIR, file), 'utf8')) as { $id?: string };
    ajv.addSchema(schema);
    if (schema.$id) {
      const validate = ajv.getSchema(schema.$id);
      if (validate) validators.set(file, validate);
    }
  }
  ajvInstance = ajv;
  return ajv;
}

export function validateArtifactJson(schemaFile: ArtifactSchemaFile, data: unknown): string[] {
  loadAjv();
  const validate = validators.get(schemaFile);
  if (!validate) return [`Schema nicht geladen: ${schemaFile}`];
  if (validate(data)) return [];
  return (validate.errors ?? []).map((error) => {
    const path = error.instancePath || '/';
    return `${schemaFile}${path}: ${error.message ?? 'ungültig'}`;
  });
}

export function validateArtifactsWithJsonSchema(artifacts: {
  pages: unknown;
  features: unknown;
  flows: unknown;
  facts: unknown;
  confidence?: unknown;
}): string[] {
  const errors: string[] = [];
  const entries: Array<[ArtifactSchemaFile, unknown, string]> = [
    ['pages.schema.json', artifacts.pages, 'pages.json'],
    ['features.schema.json', artifacts.features, 'features.json'],
    ['flows.schema.json', artifacts.flows, 'flows.json'],
    ['facts.schema.json', artifacts.facts, 'facts.json'],
  ];
  if (artifacts.confidence !== undefined) {
    entries.push(['confidence.schema.json', artifacts.confidence, 'confidence.json']);
  }
  for (const [schemaFile, data, label] of entries) {
    for (const error of validateArtifactJson(schemaFile, data)) {
      errors.push(`${label}: ${error}`);
    }
  }
  return errors;
}
