import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  define: {
    __DEV__: true,
  },
  test: {
    environment: 'node',
    include: ['src/**/__tests__/**/*.test.ts', 'src/**/__tests__/**/*.test.tsx'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      'expo-file-system/legacy': path.resolve(__dirname, 'src/test/expoFileSystemLegacy.ts'),
      'expo-file-system': path.resolve(__dirname, 'src/test/expoFileSystem.ts'),
      'expo/fetch': path.resolve(__dirname, 'src/test/expoFetch.ts'),
      'expo-constants': path.resolve(__dirname, 'src/test/expoConstants.ts'),
    },
  },
});
