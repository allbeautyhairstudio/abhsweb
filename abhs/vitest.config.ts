import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'node',
    environmentMatchGlobs: [
      ['**/*.component.test.tsx', 'jsdom'],
      ['**/hooks/*.test.ts', 'happy-dom'],
    ],
    setupFiles: ['./src/test-setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
