import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Electron loads `dist/index.html` via `file://`, so assets must be relative.
  base: './',
})
