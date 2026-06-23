import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import globals from 'globals';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  allConfig: js.configs.all,
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

export default [
  {
    ignores: [
      '**/build',
      '**/coverage',
      '**/dist',
      '**/docs',
      '**/lib',
      '**/node_modules',
      process.env.NODE_ENV === 'production' ? '**/src/**/*.spec.ts' : '',
    ],
  },
  ...compat.extends(
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ),
  {
    languageOptions: {
      globals: { ...globals.node },

      parser: tsParser,
      ecmaVersion: 2019,
      sourceType: 'commonjs',

      parserOptions: {
        project: `./tsconfig.dev.json`,
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
    },
    rules: {
      '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/no-duplicate-enum-values': 'error',
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/no-unused-expressions': 'warn',
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNullish: true }],
      'indent': ['warn', 2, { SwitchCase: 1 }],
      'max-len': ['error', { code: 120 }],
      'no-console': 'warn',
      'no-use-before-define': ['error', { classes: true, functions: true }],
      'object-curly-spacing': ['error', 'always'],
      'prefer-interface': 'off',
      'quotes': ['error', 'single'],
      'semi': ['error'],
      'template-curly-spacing': ['error', 'never'],
    },
  },
];
