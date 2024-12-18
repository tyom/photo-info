import eslint from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import tseslint from 'typescript-eslint';
import vitest from 'eslint-plugin-vitest';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: ['**/dist', 'pnpm-lock.yaml'],
  },
  eslint.configs.recommended,
  importPlugin.flatConfigs.typescript,
  ...tseslint.configs.recommended,
  {
    plugins: { import: importPlugin },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      'import/order': [
        'error',
        {
          pathGroups: [
            {
              pattern: '$**',
              group: 'internal',
              position: 'before',
            },
            {
              pattern: '$**/*',
              group: 'internal',
              position: 'before',
            },
          ],
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.test.ts'],
    plugins: {
      vitest,
    },
    rules: {
      ...vitest.configs.recommended.rules,
      'vitest/no-focused-tests': 'error',
    },
  },
);
