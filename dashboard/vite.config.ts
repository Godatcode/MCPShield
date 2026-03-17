import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',
        configure: (proxy) => {
          proxy.on('error', (_err, _req, res) => {
            // Silently return 502 so the client falls back to mock data
            if ('writeHead' in res && typeof res.writeHead === 'function') {
              res.writeHead(502, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ error: 'Backend not available' }))
            }
          })
        },
      },
    },
  },
})
