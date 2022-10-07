import { defineConfig, presetUno, presetAttributify, presetWebFonts, presetTypography, presetIcons, transformerDirectives } from 'unocss'
import presetRemToPx from '@unocss/preset-rem-to-px'
import { presetScalpel } from 'unocss-preset-scalpel'
import { presetScrollbar } from 'unocss-preset-scrollbar'
import presetDaisy from 'unocss-preset-daisy'
import { presetHeroPatterns } from '@julr/unocss-preset-heropatterns'

export default defineConfig({
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
		presetRemToPx,
		presetScalpel(),
		presetScrollbar(),
		presetDaisy(),
		presetHeroPatterns(),
	],
	shortcuts: [
	],
})
