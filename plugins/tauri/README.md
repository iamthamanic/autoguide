# @autoguide/tauri

Tauri 2 bridge for AutoGuide in desktop webviews (e.g. scriptony-multihost).

## Install

```bash
pnpm add @autoguide/tauri @autoguide/react @tauri-apps/api
```

## Setup (scriptony-multihost / Tauri 2)

1. In your Tauri frontend entry, build config with app-data paths:

```ts
import { buildTauriAutoguideConfig } from '@autoguide/tauri';
import { AutoGuideProvider, AutoGuideWidget } from '@autoguide/react';

const config = await buildTauriAutoguideConfig('scriptony-multihost');
// Persist config.outputDir → use for CLI scan --output or copy autoguide.config.json
```

2. Mount the React widget inside the webview (same as browser):

```tsx
<AutoGuideProvider appId="scriptony-multihost" mode="development">
  <App />
  <AutoGuideWidget />
</AutoGuideProvider>
```

3. Runtime DOM scan in webview:

```ts
import { createWebviewBridge } from '@autoguide/tauri';

const bridge = createWebviewBridge();
if (bridge.isTauri) {
  const snapshot = bridge.scan(window.location.pathname);
}
```

## Notes

- `.autoguide/` is stored under the Tauri app data directory per `appId`.
- Core remains DOM-free; scanning uses `@autoguide/runtime` in the webview only.
