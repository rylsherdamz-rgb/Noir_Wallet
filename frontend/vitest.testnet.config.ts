import { defineConfig, loadEnv } from 'vite'
import path from 'path'

// Opt-in live Testnet run (`npm run test:testnet`). Never part of `vitest run`
// or CI: it spends Friendbot XLM and takes a minute or two.
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./testnet/setup.ts'],
    include: ['testnet/**/*.testnet.ts'],
    testTimeout: 300_000,
    hookTimeout: 120_000,
    env: loadEnv('', __dirname, 'EXPO_PUBLIC_'),
    server: { deps: { inline: ['@stellar/stellar-sdk'] } } as any,
  },
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  define: { __DEV__: 'false' },
} as any)
