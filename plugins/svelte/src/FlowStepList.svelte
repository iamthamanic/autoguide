<script lang="ts">
  /**
   * @autoguide/svelte — numbered flow steps for Help Widget panel.
   */
  import type { FlowRecord } from '@autoguide/core';
  import { listOrderedFlowSteps } from '@autoguide/ui';

  const { flow } = $props<{ flow: FlowRecord }>();

  const steps = $derived(listOrderedFlowSteps(flow));
</script>

<ol
  style="margin:0 0 12px;padding-left:0;list-style:none;font-size:14px;color:var(--ag-text)"
>
  {#each steps as step (step.order)}
    <li style="display:flex;gap:10px;margin-bottom:8px;align-items:flex-start">
      <span
        aria-hidden="true"
        style="flex-shrink:0;width:24px;height:24px;border-radius:50%;background:var(--ag-surface-muted);border:1px solid var(--ag-border);display:inline-flex;align-items:center;justify-content:center;font-size:14px;font-weight:600;color:var(--ag-primary)"
      >
        {step.order}
      </span>
      <span>
        <strong>{step.title}</strong>
        {#if step.description}
          <span style="display:block;color:var(--ag-text-muted);font-size:12px">{step.description}</span>
        {/if}
      </span>
    </li>
  {/each}
</ol>
