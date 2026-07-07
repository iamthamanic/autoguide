import { describe, expect, it } from 'vitest';
import type { FlowRecord } from '../types/records.js';
import { generateToursFromFlows } from './generate.js';
import { isTour, validateTours } from './validate.js';

const sampleFlow: FlowRecord = {
  id: 'flow-1',
  title: 'Urlaub beantragen',
  steps: [
    { order: 1, title: 'goto /vacation', factIds: [] },
    { order: 2, title: 'click Antrag senden', factIds: [] },
  ],
  roleIds: [],
  pageIds: [],
  factIds: [],
  status: 'draft',
};

describe('guided tours', () => {
  it('generates tours from flows', () => {
    const tours = generateToursFromFlows([sampleFlow]);
    expect(tours).toHaveLength(1);
    expect(tours[0]?.steps).toHaveLength(2);
    expect(tours[0]?.steps[1]?.action).toBe('click');
  });

  it('validates tour schema', () => {
    const tours = generateToursFromFlows([sampleFlow]);
    expect(validateTours(tours)).toEqual([]);
    expect(isTour(tours[0])).toBe(true);
  });
});
