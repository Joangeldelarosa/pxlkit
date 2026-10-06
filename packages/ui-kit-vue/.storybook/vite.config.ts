import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

const at = (path: string) => fileURLToPath(new URL(path, import.meta.url));

// The stories render the kit from source, as its test suites do: a change
// shows without rebuilding the kit or its core.
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: [
      { find: /^@pxlkit\/ui-kit-vue$/, replacement: at('../src/index.ts') },
      { find: /^@pxlkit\/ui-kit-core$/, replacement: at('../../ui-kit-core/src/index.ts') },
    ],
  },
});
