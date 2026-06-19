import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync } from 'node:fs'
import { resolve } from 'node:path'

const base = process.env.VITE_BASE_PATH || '/'

export default defineConfig({
  base,
  plugins: [
    react(),
    {
      name: 'github-pages-spa-fallback',
      closeBundle() {
        if (base !== '/') {
          const index = resolve('dist/index.html')
          copyFileSync(index, resolve('dist/404.html'))
        }
      },
    },
  ],
})
