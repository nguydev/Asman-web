import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/socket.io': {
        target: 'https://asman.xdtunnel.icu',
        ws: true,
        changeOrigin: true,
        secure: false,
      },
      // Freedom for Immigrants map GraphQL (CORS blocked in browser)
      '/ffi': {
        target: 'https://map.freedomforimmigrants.org',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/ffi/, ''),
      },
      '/api': {
        target: 'https://asman.xdtunnel.icu',
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: {
          '*': 'localhost',
        },
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            let setCookie = proxyRes.headers['set-cookie']
            if (setCookie) {
              // Ensure all SameSite=None cookies have the Secure flag so Chrome doesn't drop them
              proxyRes.headers['set-cookie'] = setCookie.map(cookie => {
                if (cookie.includes('SameSite=None') && !cookie.toLowerCase().includes('secure')) {
                  return cookie + '; Secure'
                }
                return cookie
              })
            }
          })
        }
      },
    },
    allowedHosts: true
  },
})
