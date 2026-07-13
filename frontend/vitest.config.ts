import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  plugins: [{
    name: 'mock-binaries',
    enforce: 'pre',
    resolveId(id: string) {
      if (id.endsWith('.jpg') || id.endsWith('.png') || id.endsWith('.jpeg')) return id
    },
    load(id: string) {
      if (id.endsWith('.jpg') || id.endsWith('.png') || id.endsWith('.jpeg')) return 'export default "mocked.jpg"'
    },
  }],
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.ts'],
    testTimeout: 30000,
    server: {
      deps: {
        inline: ['@stellar/stellar-sdk'],
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    __DEV__: 'true',
  },
})
