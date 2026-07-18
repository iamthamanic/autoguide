<script lang="ts">
  /**
   * @iamthamanic/autoguide-svelte — dev-only confidence and provenance badge for facts.
   */
  import type { Fact, VisibilityMode } from '@iamthamanic/autoguide-core';
  import { getReviewBadgeState, type ReviewBadgeSurface } from '@iamthamanic/autoguide-ui';

  const {
    fact,
    mode,
    surface = 'review',
  }: { fact: Fact; mode: VisibilityMode; surface?: ReviewBadgeSurface } = $props();

  const state = $derived(getReviewBadgeState(fact, mode, surface));
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
