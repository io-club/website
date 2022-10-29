module.exports = {
	env: {
		browser: true,
		node: true,
	},
	ignorePatterns: [
		'node_modules',
	],
	extends: [
		'@remix-run/eslint-config',
		'@remix-run/eslint-config/node',
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
	],
	parserOptions: {
		ecmaVersion: 13,
		parser: '@typescript-eslint/parser',
		sourceType: 'module',
	},
	plugins: [
		'@typescript-eslint',
		'simple-import-sort',
		'unused-imports',
	],
	rules: {
		quotes: ['error', 'single'],
		'simple-import-sort/imports': ['error', {
			groups: [
				['.*\\u0000$'],
				['^\\u0000'],
				['^@?\\w'],
				['^'],
				['^\\.'],
			],
		}],
		'simple-import-sort/exports': 'error',
		'import/first': 'error',
		'import/newline-after-import': 'error',
		'import/no-duplicates': 'error',
		'unused-imports/no-unused-imports': 'error',
		'no-multiple-empty-lines': 'error',
		'no-extra-semi': 'error',
		'no-trailing-spaces': 'error',
		'no-multi-spaces': 'error',
		'linebreak-style': ['error', 'unix'],
		'semi': ['error', 'never'],
		'padding-line-between-statements': [
			'error',
			{ 'blankLine': 'always', 'prev': 'function', 'next': '*' },
			{ 'blankLine': 'always', 'prev': 'export', 'next': '*' },
			{ 'blankLine': 'always', 'prev': 'multiline-var', 'next': '*' },
			{ 'blankLine': 'always', 'prev': 'multiline-let', 'next': '*' },
			{ 'blankLine': 'always', 'prev': 'multiline-const', 'next': '*' },
			{ 'blankLine': 'always', 'prev': 'class', 'next': '*' },
			{ 'blankLine': 'always', 'prev': 'function', 'next': '*' },
		],
		'comma-spacing': 'error',
		'key-spacing': 'error',
		'eol-last': ['error', 'always'],
		'@typescript-eslint/explicit-module-boundary-types': 'off',
		'@typescript-eslint/no-empty-interface': 'off',
		'@typescript-eslint/ban-ts-comment': 'off',
		'@typescript-eslint/indent': [
			'error',
			'tab',
			{
				ignoredNodes: ['TSTypeParameterInstantiation']
			}
		],
	},
	overrides: [
		{
			files: ['*.js', '*.cjs'],
			rules: {
				'@typescript-eslint/no-var-requires': 'off'
			}
		}
	]
}
