import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), TanStackRouterVite()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),

      // fix loading all icon chunks in dev mode
      // https://github.com/tabler/tabler-icons/issues/1233
      '@tabler/icons-react': '@tabler/icons-react/dist/esm/icons/index.mjs',
    },
  },
  build: {
     // Use esbuild for minification (faster than terser)
    minify: 'esbuild',

    // Increase chunk size warning limit for large apps
    chunkSizeWarningLimit: 10000,

    // Optimize chunk splitting
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Split node_modules into separate chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('@mui') || id.includes('@emotion')) {
              return 'ui-vendor';
            }
            return 'vendor';
          }
        }
      }
    },

    // Enable source maps only if needed
    sourcemap: false, // Set to true for debugging production

    // Target modern browsers for smaller bundles
    target: 'es2015',

    // Increase CPU usage for faster builds
    cssCodeSplit: true,
  }
})
