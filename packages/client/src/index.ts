/**
 * @autoguide/client — browser artifact loader for host applications.
 */

export { loadArtifactBundle } from './load.js';
export {
  OPTIONAL_RUNTIME_FILES,
  REQUIRED_RUNTIME_FILES,
  RUNTIME_ARTIFACT_FILES,
} from './artifacts.js';
export type {
  ClientArtifactBundle,
  DocBundleManifest,
  LoadArtifactBundleOptions,
} from './types.js';
