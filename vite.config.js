import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 5174 },
  // The lazy-loaded 3D chunk (three.js + drei) is ~1 MB by design; it loads after first paint.
  build: { chunkSizeWarningLimit: 1200 },
});
