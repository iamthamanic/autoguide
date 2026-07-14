<script lang="ts">
  import type { Fact, FlowRecord, PageRecord, VisibilityMode } from '@iamthamanic/autoguide-core';
  import AutoGuideProvider from './AutoGuideProvider.svelte';
  import AutoGuideWidget from './AutoGuideWidget.svelte';

  export let appId: string;
  export let userRole: string | undefined = undefined;
  export let mode: VisibilityMode = 'development';
  export let route: string = '/';
  export let facts: Fact[] = [];
  export let pages: PageRecord[] = [];
  export let flows: FlowRecord[] = [];
  export let loading = false;
  export let error: string | null = null;
  export let onRetry: (() => void) | undefined = undefined;
</script>

<AutoGuideProvider {appId} {userRole} {mode} {route} {facts} {pages} {flows} {loading} {error} {onRetry}>
  <AutoGuideWidget />
</AutoGuideProvider>
