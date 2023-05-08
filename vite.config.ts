import path from 'path';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    emptyOutDir: true,
    lib: {
      entry: path.resolve(__dirname, './lib/index.ts'),
      formats: ['es', 'cjs'],
    },
    sourcemap: true,
  },
});
