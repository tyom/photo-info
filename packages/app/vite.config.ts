import path from 'node:path';
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import Icons from 'unplugin-icons/vite';

export default defineConfig({
  plugins: [svelte(), Icons({ compiler: 'svelte' })],
  base: '',
  resolve: {
    alias: {
      $stores: path.resolve('./src/stores'),
      $lib: path.resolve('./src/lib'),
    },
  },
});
