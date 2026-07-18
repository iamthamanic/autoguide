<script lang="ts">
  /**
   * @iamthamanic/autoguide-svelte — Help Widget with context resolution and search.
   */
  import {
    explainHelpGap,
    formatHelpActionText,
    resolveHelpContext,
    searchKnowledge,
  } from '@iamthamanic/autoguide-core';
  import { agTokenCssVars, bindFocusTrap } from '@iamthamanic/autoguide-ui';
  import FlowStepList from './FlowStepList.svelte';
  import PanelSkeleton from './PanelSkeleton.svelte';
  import ReviewBadge from './ReviewBadge.svelte';
  import { useAutoGuide } from './context.js';

  const ctx = useAutoGuide();
  let open = $state(false);
  let query = $state('');
  let panelEl: HTMLElement | undefined = $state();

  const tokenVars = agTokenCssVars();
  const tokenStyle = Object.entries(tokenVars)
    .map(([key, value]) => `${key}: ${value}`)
    .join('; ');
  const helpContext = $derived(
    resolveHelpContext(ctx.route, ctx.pages, ctx.flows, ctx.facts, ctx.mode, ctx.userRole),
  );
  const gapReasons = $derived(
    explainHelpGap({
      mode: ctx.mode,
      route: ctx.route,
      pages: ctx.pages,
      flows: ctx.flows,
      facts: ctx.facts,
      userRole: ctx.userRole,
    }),
  );
  const searchHits = $derived(searchKnowledge(query, ctx.pages, ctx.flows, ctx.userRole));

  function closePanel() {
    open = false;
  }

  function toggleOpen() {
    open = !open;
  }

  $effect(() => {
    if (!open || !panelEl) return;
    return bindFocusTrap(panelEl, closePanel);
  });
</script>

<div style={tokenStyle}>
  <button
    type="button"
    aria-label="Hilfe öffnen"
    aria-expanded={open}
    onclick={toggleOpen}
    style="position:fixed;right:24px;bottom:24px;width:56px;height:56px;border-radius:50%;border:none;background:var(--ag-primary);color:#fff;cursor:pointer;z-index:9999;box-shadow:var(--ag-shadow)"
  >
    ?
  </button>

  {#if open}
    <div
      bind:this={panelEl}
      role="dialog"
      aria-label="AutoGuide Hilfe"
      aria-busy={ctx.loading ? true : undefined}
      style="position:fixed;right:24px;bottom:96px;width:380px;max-width:calc(100vw - 48px);background:var(--ag-surface);border:1px solid var(--ag-border);border-radius:var(--ag-radius);box-shadow:var(--ag-shadow);padding:16px;z-index:9999;color:var(--ag-text)"
    >
      <div style="display:flex;justify-content:space-between;align-items:center">
        <h2 style="margin:0 0 8px;font-size:16px;font-weight:600">
          Hilfe{helpContext.pageTitle ? `: ${helpContext.pageTitle}` : ''}
        </h2>
        <button
          type="button"
          aria-label="Hilfe schließen"
          onclick={closePanel}
          style="border:none;background:transparent;color:var(--ag-text-muted);cursor:pointer;font-size:18px;line-height:1"
        >
          ×
        </button>
      </div>

      {#if ctx.error}
        <div role="alert" style="font-size:14px">
          <p style="margin:0 0 12px;color:var(--ag-warning)">{ctx.error}</p>
          {#if ctx.onRetry}
            <button
              type="button"
              onclick={ctx.onRetry}
              style="padding:8px 12px;border-radius:var(--ag-radius);border:1px solid var(--ag-border);background:var(--ag-surface-muted);cursor:pointer;font-size:14px"
            >
              Erneut versuchen
            </button>
          {/if}
        </div>
      {:else if ctx.loading}
        <PanelSkeleton />
      {:else}
        <input
          type="search"
          placeholder="Suchen…"
          bind:value={query}
          style="width:100%;margin-bottom:12px;padding:8px 10px;border-radius:6px;border:1px solid var(--ag-border);font-size:14px;color:var(--ag-text)"
        />
        {#if query.trim()}
          <ul style="margin:0;padding-left:18px;font-size:14px">
            {#if searchHits.length === 0}
              <li>Keine Treffer.</li>
            {:else}
              {#each searchHits as hit (hit.kind + hit.id)}
                <li><strong>{hit.title}</strong> ({hit.kindLabel})</li>
              {/each}
            {/if}
          </ul>
        {:else if (
          helpContext.actions.length === 0 &&
          helpContext.flows.length === 0 &&
          !(
            ctx.mode === 'development' &&
            helpContext.draftDigest &&
            helpContext.draftDigest.samples.length > 0
          )
        )}
          <div style="font-size:14px">
            <p style="margin:0;color:var(--ag-text-muted)">Keine Dokumentation für diese Seite.</p>
            {#if gapReasons.length > 0}
              <ul
                style="margin:10px 0 0;padding-left:18px;color:var(--ag-text-muted);font-size:13px;line-height:1.45"
              >
                {#each gapReasons as reason (reason.id)}
                  <li>{reason.message}</li>
                {/each}
              </ul>
            {/if}
          </div>
        {:else if (
          helpContext.actions.length === 0 &&
          helpContext.flows.length === 0 &&
          helpContext.draftDigest &&
          helpContext.draftDigest.samples.length > 0
        )}
          <div style="font-size:14px">
            <p style="margin:0;color:var(--ag-text-muted)">Entwürfe vorhanden — noch nicht freigegeben.</p>
            <p style="margin:8px 0 0;font-size:13px;color:var(--ag-text-muted)">
              {helpContext.draftDigest.pendingFactCount} offene Fakten ·
              {helpContext.draftDigest.pageCount} Seiten ·
              {helpContext.draftDigest.flowCount} Abläufe
            </p>
            <h3 style="margin:12px 0 6px;font-size:14px;font-weight:600">Entwurf (Auswahl)</h3>
            <ul style="margin:0;padding-left:18px;font-size:14px">
              {#each helpContext.draftDigest.samples as fact (fact.id)}
                <li>
                  {formatHelpActionText(fact)}
                  <ReviewBadge {fact} mode={ctx.mode} surface="help" />
                </li>
              {/each}
            </ul>
          </div>
        {:else}
          {#if helpContext.flows.length > 0}
            <h3 style="margin:0 0 6px;font-size:14px;font-weight:600">Abläufe</h3>
            {#each helpContext.flows as flow (flow.id)}
              <div style="margin-bottom:12px">
                <p style="margin:0 0 6px;font-size:14px;font-weight:600">{flow.title}</p>
                <FlowStepList {flow} />
              </div>
            {/each}
          {/if}
          {#if helpContext.actions.length > 0}
            <h3 style="margin:0 0 6px;font-size:14px;font-weight:600">Aktionen</h3>
            <ul style="margin:0;padding-left:18px;font-size:14px">
              {#each helpContext.actions as fact (fact.id)}
                <li>
                  {formatHelpActionText(fact)}
                  <ReviewBadge {fact} mode={ctx.mode} surface="help" />
                </li>
              {/each}
            </ul>
          {/if}
        {/if}
      {/if}
    </div>
  {/if}
</div>
