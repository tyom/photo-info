import path from 'node:path';
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import Icons from 'unplugin-icons/vite';

export default defineConfig({
  plugins: [svelte(), Icons({ compiler: 'svelte' })],
  base: '',
  resolve: {
    alias: {
      '$map-styles': path.resolve('./src/map-styles.ts'),
      $components: path.resolve('./src/components'),
      $runes: path.resolve('./src/runes'),
      $lib: path.resolve('./src/lib'),
    },
  },
});
