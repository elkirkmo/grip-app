/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

const REQUIRED_ENV = ['VITE_API_BASE_URL', 'VITE_APP_NAME']

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  if (command === 'build') {
    // Fail the build, not the page, when a deployment forgets its settings.
    const env = loadEnv(mode, process.cwd())
    const missing = REQUIRED_ENV.filter((name) => !env[name])
    if (missing.length) {
      throw new Error(`Set ${missing.join(', ')} (see .env.example).`)
    }
  }
  return {
    plugins: [react(), tailwindcss()],
    test: {
      environment: 'jsdom',
      setupFiles: ['src/test/setup.ts'],
      env: { VITE_API_BASE_URL: 'http://api.test', VITE_APP_NAME: 'Test Rentals' },
    },
  }
})
