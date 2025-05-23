import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import vueDevTools from 'vite-plugin-vue-devtools';

export default defineConfig({
  plugins: [vue(), vueJsx(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: {
      // 主系统的代理
      '/api': {
        target: 'http://47.111.136.109:8080',
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\\/api/, '')
      },
      // 配送系统的代理
      '/delivery-api': {
        target: 'http://47.111.136.109:8000/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/delivery-api/, '')
      }
    }
  }
});