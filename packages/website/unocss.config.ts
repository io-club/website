import { defineConfig, presetUno, presetAttributify, presetWebFonts, presetTypography, presetIcons } from 'unocss'
import presetRemToPx from '@unocss/preset-rem-to-px'
import { presetScalpel } from 'unocss-preset-scalpel'
import { presetScrollbar } from 'unocss-preset-scrollbar'
import presetDaisy from 'unocss-preset-daisy'
import { presetHeroPatterns } from '@julr/unocss-preset-heropatterns'
export default defineConfig({
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
