<script lang="ts">
  /**
   * @iamthamanic/autoguide-svelte — root provider for host applications.
   */
  import { setContext } from 'svelte';
  import type { Fact, FlowRecord, PageRecord, VisibilityMode } from '@iamthamanic/autoguide-core';
  import { AUTO_GUIDE_KEY } from './context.js';

  export let appId: string;
  export let userRole: string | undefined = undefined;
  export let mode: VisibilityMode = 'development';
  export let route: string = typeof window !== 'undefined' ? window.location.pathname : '/';
  export let facts: Fact[] = [];
  export let pages: PageRecord[] = [];
  export let flows: FlowRecord[] = [];
  export let loading = false;
  export let error: string | null = null;
  export let onRetry: (() => void) | undefined = undefined;

  setContext(AUTO_GUIDE_KEY, {
    get appId() { return appId; },
    get userRole() { return userRole; },
    get mode() { return mode; },
    get route() { return route; },
    get facts() { return facts; },
    get pages() { return pages; },
    get flows() { return flows; },
    get loading() { return loading; },
    get error() { return error; },
    get onRetry() { return onRetry; },
  });
</script>

<slot />
