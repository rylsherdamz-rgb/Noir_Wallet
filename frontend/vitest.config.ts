import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  plugins: [
    {
      name: 'mock-img-require',
      enforce: 'pre',
      transform(code, id) {
        if (id.includes('node_modules')) return
        return code.replace(/require\((['"])([^'"]+\.(?:png|jpg|jpeg))['"]\)/g, (_, q, path) => {
          return q + 'mocked.jpg' + q
        })
      },
    },
    {
      name: 'mock-binaries',
      enforce: 'post',
      resolveId(id: string) {
        if (/\.(jpg|png|jpeg)$/.test(id)) return id
      },
      load(id: string) {
        if (/\.(jpg|png|jpeg)$/.test(id)) return 'export default "mocked.jpg"'
      },
    },
  ],
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.ts'],
    testTimeout: 30000,
    deps: {
      inline: ['@stellar/stellar-sdk'],
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
