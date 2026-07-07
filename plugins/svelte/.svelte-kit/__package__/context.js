/**
 * @autoguide/svelte — Svelte context for AutoGuide runtime.
 */
import { getContext } from 'svelte';
export const AUTO_GUIDE_KEY = Symbol('autoguide');
const fallback = {
    appId: 'unknown',
    mode: 'development',
    route: '/',
    facts: [],
    pages: [],
    flows: [],
};
export function useAutoGuide() {
    return getContext(AUTO_GUIDE_KEY) ?? fallback;
}
