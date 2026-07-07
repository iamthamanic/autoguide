import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
describe('@autoguide/svelte', () => {
    it('emits compiled adapter artifacts', () => {
        expect(existsSync(new URL('../dist/index.js', import.meta.url))).toBe(true);
        expect(existsSync(new URL('../dist/AutoGuideWidget.svelte', import.meta.url))).toBe(true);
    });
});
