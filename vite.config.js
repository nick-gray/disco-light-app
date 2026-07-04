import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Set by the GitHub Pages workflow so asset paths resolve under
  // https://<user>.github.io/<repo>/ — defaults to root for local dev.
  base: process.env.BASE_PATH || '/',
})
