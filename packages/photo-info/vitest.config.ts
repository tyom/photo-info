import * as path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@mocks': path.resolve(__dirname, '../../__mocks__'),
    },
  },
  test: {
    unstubEnvs: true,
  },
});
