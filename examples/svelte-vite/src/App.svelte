<script lang="ts">
  import {
    AutoGuideProvider,
    AutoGuideWidget,
    InspectorOverlay,
  } from '@iamthamanic/autoguide-svelte';
</script>

<AutoGuideProvider appId="example-svelte-vite" userRole="Admin">
  <main style="font-family: system-ui, sans-serif; padding: 24px">
    <h1>AutoGuide Svelte Beispiel-App</h1>
    <p>Willkommen in der Svelte-Referenz-App für AutoGuide.</p>
    <button type="button">Aktion speichern</button>
  </main>
  <AutoGuideWidget />
  <InspectorOverlay />
</AutoGuideProvider>
