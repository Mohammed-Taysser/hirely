import js from '@eslint/js';
import json from '@eslint/json';
import prettierConfig from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import prettierPlugin from 'eslint-plugin-prettier';
import sonarjs from 'eslint-plugin-sonarjs';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  // Base JS rules
  {
    files: ['**/*.{js,ts}'],
    plugins: { js, sonarjs },
    extends: ['js/recommended'],
    rules: {
      ...sonarjs.configs.recommended.rules,
      'security-node/detect-crlf': 'off',
    },
  },

  // JSON linting
  {
    files: ['**/*.json'],
    plugins: { json },
    language: 'json/json',
    extends: ['json/recommended'],
  },

  // TypeScript & Node.js setup
  {
    files: ['**/*.{js,ts}'],
    languageOptions: {
      globals: globals.node,
      // parserOptions: {
      //   project: './tsconfig.json', // 👈 path to your TS project
      //   tsconfigRootDir: import.meta.dirname, // ensure correct cwd
      // },
    },
    plugins: {
      import: importPlugin,
      prettier: prettierPlugin,
    },
    extends: [],
    settings: {},

    rules: {
      // Import organization
      'import/order': [
        'warn',
        {
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],

      // Prettier integration
      'prettier/prettier': 'warn',

      // TypeScript unused vars
      '@typescript-eslint/no-unused-vars': ['error'],
    },
  },

  // DDD layer boundaries
  {
    files: ['src/modules/**/*.ts', 'src/jobs/**/*.ts', 'src/commands/**/*.ts'],
    rules: {
      'import/no-restricted-paths': [
        'error',
        {
          basePath: '.',
          zones: [
            {
              target: './src/modules/*/domain',
              from: './src/modules/*/application',
              message: 'Domain must not depend on application.',
            },
            {
              target: './src/modules/*/domain',
              from: './src/modules/*/infrastructure',
              message: 'Domain must not depend on infrastructure.',
            },
            {
              target: './src/modules/*/domain',
              from: './src/modules/*/presentation',
              message: 'Domain must not depend on presentation.',
            },
            {
              target: './src/modules/*/application',
              from: './src/modules/*/infrastructure',
              message: 'Application must not depend on infrastructure.',
            },
            {
              target: './src/modules/*/application',
              from: './src/modules/*/presentation',
              message: 'Application must not depend on presentation.',
            },
            {
              target: './src/modules/auth/application',
              from: './src/modules/user/domain',
              message: 'Auth application should depend on user application contracts, not user domain.',
            },
            {
              target: './src/modules/auth/application',
              from: './src/modules/user/application/use-cases',
              message:
                'Auth application should depend on user application services/contracts, not user use-case implementations.',
            },
            {
              target: './src/modules/*/infrastructure',
              from: './src/modules/*/presentation',
              message: 'Infrastructure must not depend on presentation.',
            },
            {
              target: './src/jobs',
              from: './src/modules/*/presentation',
              message: 'Jobs/workers must not depend on presentation.',
            },
            {
              target: './src/commands',
              from: './src/modules/*/presentation',
              message: 'Commands must not depend on presentation.',
            },
          ],
        },
      ],
    },
  },

  // Extend Prettier compatibility
  { rules: prettierConfig.rules },

  // TypeScript recommended rules
  tseslint.configs.recommended,
]);
