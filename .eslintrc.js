module.exports = {
	env: {
		browser: true,
		node: true,
	},
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
	],
	parserOptions: {
		ecmaVersion: 13,
		parser: '@typescript-eslint/parser',
		sourceType: "module",
	},
	plugins: [
		'@typescript-eslint',
		'simple-import-sort',
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
