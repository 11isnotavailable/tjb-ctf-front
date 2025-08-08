import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'vue': 'vue/dist/vue.esm-bundler.js'
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5005',
        changeOrigin: true,
        timeout: 300000, // 5分钟超时，与前端axios保持一致
        proxyTimeout: 300000 // 代理超时时间
      },
      '/question': {
        target: 'http://localhost:5005',
        changeOrigin: true,
        timeout: 300000, // 5分钟超时，与前端axios保持一致  
        proxyTimeout: 300000 // 代理超时时间
      }
    }
  },
  build: {
    // 分块策略
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'element-plus': ['element-plus'],
          'axios': ['axios']
        }
      }
    },
    // 启用sourcemap
    sourcemap: true
  }
})
