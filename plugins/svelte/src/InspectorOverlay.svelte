<script lang="ts">
  /**
   * @autoguide/svelte — Inspector overlay for dev-mode element inspection.
   */
  import { scanDom } from '@autoguide/runtime';
  import type { RuntimeElement } from '@autoguide/runtime';
  import { useAutoGuide } from './context.js';

  const ctx = useAutoGuide();
  let active = $state(false);
  let selected = $state<RuntimeElement | null>(null);

  function toggleInspector() {
    active = !active;
    selected = null;
  }

  function onMouseOver(event: MouseEvent) {
    if (!active) return;
    event.stopPropagation();
    const target = event.target as HTMLElement;
    target.style.outline = '2px solid #2563eb';
  }

  function onClickCapture(event: MouseEvent) {
    if (!active) return;
    event.preventDefault();
    event.stopPropagation();
    const target = event.target as HTMLElement;
    const snapshot = scanDom(document, window.location.pathname);
    const match = snapshot.elements.find((el) => target.matches(el.selector));
    selected = match ?? null;
    active = false;
  }
</script>

{#if ctx.mode === 'development'}
  <button
    type="button"
    onclick={toggleInspector}
    style="position:fixed;right:24px;bottom:88px;z-index:9999;padding:8px 12px;border-radius:8px;border:none;background:{active ? '#1d4ed8' : '#64748b'};color:#fff;cursor:pointer"
  >
    Inspector
  </button>
  {#if active}
    <div
      style="position:fixed;inset:0;z-index:9998;cursor:crosshair"
      onmouseover={onMouseOver}
      onclickcapture={onClickCapture}
    ></div>
  {/if}
  {#if selected}
    <div
      style="position:fixed;right:24px;bottom:140px;width:320px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:12px;z-index:9999"
    >
      <strong>Element</strong>
      <p style="margin:8px 0 0;font-size:14px">{selected.label ?? selected.selector}</p>
      <p style="margin:4px 0 0;color:#64748b;font-size:12px">{selected.selector}</p>
    </div>
  {/if}
{/if}
