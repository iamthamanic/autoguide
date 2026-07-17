/**
 * @iamthamanic/autoguide-cli — flow seeding hint tests.
 */

import { describe, expect, it } from 'vitest';
import { FLOW_SEEDING_HINT, flowSeedingWarning } from './flow-seeding-hint.js';

describe('flowSeedingWarning', () => {
  it('returns undefined when at least one flow exists', () => {
    expect(flowSeedingWarning(1)).toBeUndefined();
    expect(flowSeedingWarning(3)).toBeUndefined();
  });

  it('returns the documented Playwright import path when empty', () => {
    expect(flowSeedingWarning(0)).toBe(FLOW_SEEDING_HINT);
    expect(FLOW_SEEDING_HINT).toContain('--playwright-import');
    expect(FLOW_SEEDING_HINT).toContain('integrations/hr-workflows');
  });
});
