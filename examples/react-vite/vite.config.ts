import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import autoguide from '@autoguide/vite';

export default defineConfig({
  plugins: [react(), autoguide()],
  server: { port: 5173 },
});