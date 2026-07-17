/**
 * @iamthamanic/autoguide-cli — flow seeding hint tests.
 */

import { describe, expect, it } from 'vitest';
import {
  FLOW_SEEDING_HINT,
  countOrderedFlows,
  flowSeedingWarning,
  hasOrderedSteps,
} from './flow-seeding-hint.js';

describe('flowSeedingWarning', () => {
  it('returns undefined when at least one ordered flow exists', () => {
    expect(flowSeedingWarning(1)).toBeUndefined();
    expect(flowSeedingWarning(3)).toBeUndefined();
  });

  it('returns the documented Playwright import path when empty', () => {
    expect(flowSeedingWarning(0)).toBe(FLOW_SEEDING_HINT);
    expect(FLOW_SEEDING_HINT).toContain('--playwright-import');
    expect(FLOW_SEEDING_HINT).toContain('integrations/hr-workflows');
    expect(FLOW_SEEDING_HINT).toContain('examples/react-vite');
  });
});

describe('hasOrderedSteps / countOrderedFlows', () => {
  it('counts only flows with at least one step', () => {
    expect(hasOrderedSteps({ steps: [{ order: 1, title: 'a' }] })).toBe(true);
    expect(hasOrderedSteps({ steps: [] })).toBe(false);
    expect(hasOrderedSteps({})).toBe(false);
    expect(
      countOrderedFlows([{ steps: [] }, { steps: [{ order: 1, title: 'x' }] }, null]),
    ).toBe(1);
  });
});
