const { presetScrollbar } = require('unocss-preset-scrollbar')
const { presetHeroPatterns } = require('@julr/unocss-preset-heropatterns')
const { presetAttributify, presetIcons, presetTypography, presetUno, presetWebFonts, transformerDirectives } = require('unocss')

module.exports = {
	plugins: [
		require('postcss-import'),
		require('postcss-url'),
		require('postcss-nesting'),
		require('postcss-pseudo-class-enter'),
		require('autoprefixer'),
		require('@ioclub/postcss-unocss')({
			patterns: [
				'app/**/*.{tsx,jsx,mdx}',
				'app/styles/**/*.css',
			],
			watch: (process.env.MODE || process.env.NODE_ENV) !== 'production',
			outFile: 'app/uno.css',
			transformers: [
				transformerDirectives(),
			],
			presets: [
				presetUno(),
				presetAttributify({
					prefix: 'w-',
				}),
				presetTypography(),
				presetIcons(),
				presetWebFonts(),
				presetScrollbar(),
				presetHeroPatterns(),
				import('unocss-preset-daisy'),
			],
			shortcuts: [
			],
		}),
	]
}
