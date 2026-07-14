import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    tanstackStart({
      target: 'vercel',
    }),
    react(),
  ],
  resolve: {
    alias: {
      '~': resolve(import.meta.dirname, './src'),
    },
  },
})
