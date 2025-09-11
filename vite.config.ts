import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'

// https://vite.dev/config/
export default defineConfig(() => {
  // Si no está definida la variable, usar localhost
  const apiUrl = process.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000'

  return {
    plugins: [react(), TanStackRouterVite()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),

        // fix loading all icon chunks in dev mode
        // https://github.com/tabler/tabler-icons/issues/1233
        '@tabler/icons-react': '@tabler/icons-react/dist/esm/icons/index.mjs',
      },
    },
    server: {
      proxy: {
        '/api': {
          target: apiUrl,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    optimizeDeps: {
      include: ['pdfjs-dist'],
    },
    define: {
      global: 'globalThis',
    },
  }
})
