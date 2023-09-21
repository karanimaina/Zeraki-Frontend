/* eslint-disable no-undef */
module.exports = {
	env: {
		browser: true,
		es2021: true
	},
	extends: [
		"eslint:recommended",
		"plugin:@typescript-eslint/recommended"
	],
	parser: "@typescript-eslint/parser",
	parserOptions: {
		ecmaVersion: "latest",
		sourceType: "module"
	},
	plugins: ["@typescript-eslint", "unused-imports"],
	rules: {
		"@typescript-eslint/no-explicit-any": "off", // Not recommended but a quick fix
		"@typescript-eslint/no-non-null-assertion": "off",
		"@typescript-eslint/no-empty-function": ["warn"],
		"@typescript-eslint/no-non-null-asserted-optional-chain": "warn",
		indent: ["error", "tab"],
		"linebreak-style": 0,
		"brace-style": ["error", "1tbs"],
		"space-before-blocks": ["error", "always"],
		quotes: ["error", "double"],
		semi: ["error", "always"],
		camelcase: [
			"warn",
			{
				properties: "always",
				ignoreDestructuring: true
			}
		],
		"no-unused-vars": "off", // or "@typescript-eslint/no-unused-vars": "off",
		"unused-imports/no-unused-imports": "error",
		"unused-imports/no-unused-vars": [
			"warn",
			{
				vars: "all",
				varsIgnorePattern: "^_",
				args: "after-used",
				argsIgnorePattern: "^_"
			}
		],
		"@typescript-eslint/no-inferrable-types": "error"
	}
};
