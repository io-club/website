/* eslint-disable @typescript-eslint/no-var-requires */

module.exports = {
	plugins: [
		require('postcss-import'),
		require('tailwindcss'),
		require('postcss-pseudo-class-enter'),
		require('postcss-nesting'),
		require('autoprefixer'),
	]
}
