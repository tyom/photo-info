import { defineConfig } from 'tsup';

export default defineConfig({
  format: ['cjs', 'esm'],
  entry: ['./src/index.ts'],
  dts: true,
  sourcemap: true,
  clean: true,
  minify: true,
  bundle: true,
  noExternal: ['exifreader'], // include exifreader in the bundle
  splitting: false,
  env: {
    DEBUG: process.env.DEBUG ?? '0',
  },
});
