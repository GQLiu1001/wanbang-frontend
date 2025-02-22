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
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    port: 5173, // 前端运行在 5173 端口（可根据需要调整）
    proxy: {
      '/api': {
        target: 'http://localhost:80', // 代理到 Nginx 的地址
        changeOrigin: true, // 修改请求头中的 origin
        // 不需要 rewrite，因为 Nginx 会处理 /api/ 的转发
      }
    }
  }
})