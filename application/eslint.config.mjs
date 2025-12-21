import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';
import tsParser from '@typescript-eslint/parser';
import jsdocPlugin from 'eslint-plugin-jsdoc';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({ baseDirectory: __dirname });

const config = [
  ...compat.config({
    extends: ['next/core-web-vitals', 'next/typescript'],
  }),
  {
    files: ['**/*.{js,jsx,ts,tsx,mjs,cjs}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      jsdoc: jsdocPlugin,
    },
    settings: {
      jsdoc: {
        mode: 'typescript',
      },
    },
    rules: {
      // JSDoc: keep helpful checks, but don't block builds on requiring docs everywhere.
      // (We can re-tighten later once modules stabilize.)
      'jsdoc/require-jsdoc': 'off',
      'jsdoc/require-description': 'off',

      'jsdoc/require-returns': 'off',
      'jsdoc/require-returns-description': 'off',
      'jsdoc/require-param': 'off',
      'jsdoc/require-param-description': 'off',
      'jsdoc/require-param-type': 'off',
      'jsdoc/require-returns-type': 'off',
      'jsdoc/check-param-names': 'off',

      'jsdoc/check-tag-names': 'warn',
      'jsdoc/check-alignment': 'warn',
    },
  },
];

export default config;
