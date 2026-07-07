import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { AutoGuideContextService } from './context.js';

describe('@autoguide/angular', () => {
  it('emits compiled adapter artifacts', () => {
    expect(existsSync(new URL('../dist/index.js', import.meta.url))).toBe(true);
    expect(existsSync(new URL('../dist/autoguide-widget.component.js', import.meta.url))).toBe(true);
  });

  it('stores provider inputs in context service', () => {
    const ctx = new AutoGuideContextService();
    ctx.appId = 'demo';
    ctx.route = '/vacation';
    ctx.mode = 'published';
    expect(ctx.appId).toBe('demo');
    expect(ctx.route).toBe('/vacation');
    expect(ctx.mode).toBe('published');
  });
});
