import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'Pulse',
      fileName: 'index',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      // Mark React and Vue as external dependencies (peer dependencies)
      // They should be provided by the consuming application
      external: ['react', 'vue'],
      output: {
        preserveModules: false, // Better tree shaking
        globals: {
          react: 'React',
          vue: 'Vue',
        },
      },
    },
    // Minify for production (using esbuild - faster and already included with Vite)
    minify: 'esbuild',
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Source maps for debugging
    sourcemap: true,
    // Target modern browsers for smaller output
    target: 'es2020',
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [],
  },
});


