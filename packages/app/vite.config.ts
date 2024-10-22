import path from 'node:path';
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  base: '',
  resolve: {
    alias: {
      $stores: path.resolve('./stores'),
      $lib: path.resolve('./lib'),
    },
  },
});
