import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Put static files into the root of the build, e.g. /logo.png
  publicDir: '.',
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
