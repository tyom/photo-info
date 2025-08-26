import path from 'node:path';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import Icons from 'unplugin-icons/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [tailwindcss(), svelte(), Icons({ compiler: 'svelte' })],
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
