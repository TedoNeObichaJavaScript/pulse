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
      output: {
        preserveModules: false, // Better tree shaking
        // Minify for production
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: false, // Keep console for debugging
            drop_debugger: true,
            pure_funcs: ['console.debug'], // Remove debug logs
          },
        },
      },
    },
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


