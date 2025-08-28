import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(), // Add Tailwind CSS as a plugin
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: {
      // 代理所有API请求到Laravel后端
      '/api': 'http://127.0.0.1:8001',
      '/sanctum': 'http://127.0.0.1:8001',
      // 所有认证端点现在都在 /api 前缀下
    }
  }
})
