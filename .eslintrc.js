module.exports = {
	env: {
		'browser': true,
		'amd': true,
		'node': true,
	},
	extends: [
		'eslint:recommended',
		'plugin:vue/vue3-recommended',
		'plugin:@typescript-eslint/recommended',
	],
	plugins: ['simple-import-sort'],
	rules: {
		'simple-import-sort/sort': 'error',
		'vue/require-prop-types': 'off',
		quotes: ['error', 'single'],
	},
}
