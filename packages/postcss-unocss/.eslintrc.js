module.exports = {
	extends: '../../.eslintrc.js',
	ignorePatterns: [
		'nexus.d.ts',
		'dist',
	],
	rules: {
		'@typescript-eslint/no-non-null-assertion': 'off',
	},
}
