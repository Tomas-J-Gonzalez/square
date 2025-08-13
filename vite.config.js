import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Copy static files from assets/ to /assets in the build
  publicDir: 'assets',
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
