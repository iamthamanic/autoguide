<script lang="ts">
  /**
   * @autoguide/svelte — Help Widget with context resolution and search.
   */
  import { resolveHelpContext, searchKnowledge } from '@autoguide/core';
  import { useAutoGuide } from './context.js';

  const ctx = useAutoGuide();
  let open = $state(false);
  let query = $state('');

  const helpContext = $derived(
    resolveHelpContext(ctx.route, ctx.pages, ctx.flows, ctx.facts, ctx.mode, ctx.userRole),
  );
  const searchHits = $derived(searchKnowledge(query, ctx.pages, ctx.flows));
</script>

<button
  type="button"
  aria-label="Hilfe öffnen"
  onclick={() => (open = !open)}
  style="position:fixed;right:24px;bottom:24px;width:56px;height:56px;border-radius:50%;border:none;background:#2563eb;color:#fff;cursor:pointer;z-index:9999"
>
  ?
</button>

{#if open}
  <div
    role="dialog"
    aria-label="AutoGuide Hilfe"
    style="position:fixed;right:24px;bottom:96px;width:380px;max-width:calc(100vw - 48px);background:#fff;border:1px solid #e2e8f0;border-radius:8px;box-shadow:0 4px 24px rgba(0,0,0,0.12);padding:16px;z-index:9999"
  >
    <h2 style="margin:0 0 8px;font-size:16px">
      Hilfe{helpContext.pageTitle ? `: ${helpContext.pageTitle}` : ''}
    </h2>
    <input
      type="search"
      placeholder="Suchen…"
      bind:value={query}
      style="width:100%;margin-bottom:12px;padding:8px 10px;border-radius:6px;border:1px solid #e2e8f0;font-size:14px"
    />
    {#if query.trim()}
      <ul style="margin:0;padding-left:18px;font-size:14px">
        {#if searchHits.length === 0}
          <li>Keine Treffer.</li>
        {:else}
          {#each searchHits as hit (hit.kind + hit.id)}
            <li><strong>{hit.title}</strong> ({hit.kind})</li>
          {/each}
        {/if}
      </ul>
    {:else if helpContext.actions.length === 0 && helpContext.flows.length === 0}
      <p style="margin:0;color:#64748b;font-size:14px">
        Keine Dokumentation für diese Seite.{ctx.mode === 'development' ? ' (Entwicklermodus)' : ''}
      </p>
    {:else}
      {#if helpContext.flows.length > 0}
        <h3 style="margin:0 0 6px;font-size:14px">Abläufe</h3>
        <ul style="margin:0 0 12px;padding-left:18px;font-size:14px">
          {#each helpContext.flows as flow (flow.id)}
            <li>{flow.title}</li>
          {/each}
        </ul>
      {/if}
      {#if helpContext.actions.length > 0}
        <h3 style="margin:0 0 6px;font-size:14px">Aktionen</h3>
        <ul style="margin:0;padding-left:18px;font-size:14px">
          {#each helpContext.actions as fact (fact.id)}
            <li>
              <strong>{fact.key}</strong>: {String(fact.value ?? '')}
              {#if ctx.mode === 'development' && fact.confidence < 0.85}
                <span style="color:#b45309"> (unsicher)</span>
              {/if}
            </li>
          {/each}
        </ul>
      {/if}
    {/if}
  </div>
{/if}
