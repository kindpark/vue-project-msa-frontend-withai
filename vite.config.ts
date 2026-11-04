import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: {
      // User Service
      '/api/v1/users': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
      // Product Service
      '/api/v1/products': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
      // Order & Payment Service
      '/api/v1/orders': {
        target: 'http://localhost:8083',
        changeOrigin: true,
      },
      '/api/v1/payments': {
        target: 'http://localhost:8083',
        changeOrigin: true,
      },
      // CS (QnA) Service - ASP.NET Core
      '/api/v1/qna': {
        target: 'http://localhost:5231',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})