# @autoguide/vite

Vite plugin for AutoGuide drop-in integration.

## Usage

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import autoguide from '@autoguide/vite';

export default defineConfig({
  plugins: [react(), autoguide()],
});
```

```ts
import { bundleBase } from 'virtual:autoguide';
// bundleBase === '/autoguide'
```

Copies `.autoguide/*.json` to `public/autoguide/` on dev start and build.
