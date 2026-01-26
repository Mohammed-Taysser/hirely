import js from "@eslint/js";
import json from "@eslint/json";
import prettierConfig from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import prettierPlugin from "eslint-plugin-prettier";
import sonarjs from "eslint-plugin-sonarjs";
import { defineConfig } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
	// Base JS rules
	{
		files: ["**/*.{js,ts}"],
		plugins: { js, sonarjs },
		extends: ["js/recommended"],
		rules: {
			...sonarjs.configs.recommended.rules,
			"security-node/detect-crlf": "off",
		},
	},

	// JSON linting
	{
		files: ["**/*.json"],
		plugins: { json },
		language: "json/json",
		extends: ["json/recommended"],
	},

	// TypeScript & Node.js setup
	{
		files: ["**/*.{js,ts}"],
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
			"import/order": [
				"warn",
				{
					"newlines-between": "always",
					alphabetize: { order: "asc", caseInsensitive: true },
				},
			],

			// Prettier integration
			"prettier/prettier": "warn",

			// TypeScript unused vars
			"@typescript-eslint/no-unused-vars": ["error"],
		},
	},

	// Extend Prettier compatibility
	{ rules: prettierConfig.rules },

	// TypeScript recommended rules
	tseslint.configs.recommended,
]);
