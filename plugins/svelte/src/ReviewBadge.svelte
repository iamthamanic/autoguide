<script lang="ts">
  /**
   * @autoguide/svelte — dev-only confidence and provenance badge for facts.
   */
  import type { Fact, VisibilityMode } from '@autoguide/core';
  import { getReviewBadgeState } from '@autoguide/ui';

  const { fact, mode } = $props<{ fact: Fact; mode: VisibilityMode }>();

  const state = $derived(getReviewBadgeState(fact, mode));
</script>

{#if state.visible}
  <span
    title={state.title}
    style:margin-left="6px"
    style:font-size="12px"
    style:font-weight="600"
    style:color={`var(${state.colorVar})`}
  >
    ({state.label})
  </span>
{/if}
