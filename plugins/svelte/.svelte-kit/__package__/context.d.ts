/**
 * @autoguide/svelte — Svelte context for AutoGuide runtime.
 */
import type { Fact, FlowRecord, PageRecord, VisibilityMode } from '@autoguide/core';
export declare const AUTO_GUIDE_KEY: unique symbol;
export interface AutoGuideContextValue {
    appId: string;
    userRole?: string;
    mode: VisibilityMode;
    route: string;
    facts: Fact[];
    pages: PageRecord[];
    flows: FlowRecord[];
}
export declare function useAutoGuide(): AutoGuideContextValue;
//# sourceMappingURL=context.d.ts.map