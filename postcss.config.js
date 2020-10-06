/* eslint-disable @typescript-eslint/no-var-requires */

module.exports = {
	plugins: [
		require('postcss-import'),
		require('tailwindcss'),
		require('postcss-pseudo-class-enter'),
		require('postcss-nested-ancestors'),
		require('postcss-nested'),
		require('autoprefixer'),
	]
}
