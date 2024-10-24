import { defineConfig } from 'vitest/config'

defineConfig

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/vitest.setup.ts']
  },
});