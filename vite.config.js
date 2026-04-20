import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    open: true
  },
  publicDir: 'public',
  optimizeDeps: {
    include: ['@mediapipe/hands', '@mediapipe/drawing_utils']
  }
})