import { describe, expect, it } from 'vitest';
import { isPluginCompatible } from './compatibility.js';

describe('isPluginCompatible', () => {
  it('accepts caret range for same minor line', () => {
    expect(isPluginCompatible('^0.1.0', '0.1.0')).toBe(true);
    expect(isPluginCompatible('^0.1.0', '0.1.5')).toBe(true);
  });

  it('rejects incompatible major/minor', () => {
    expect(isPluginCompatible('^0.1.0', '0.2.0')).toBe(false);
    expect(isPluginCompatible('^0.1.0', '1.0.0')).toBe(false);
  });
});
