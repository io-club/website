import { presetHeroPatterns } from '@julr/unocss-preset-heropatterns'
import { defineConfig, presetAttributify, presetIcons, presetTypography, presetUno, presetWebFonts, transformerDirectives } from 'unocss'
import presetDaisy from 'unocss-preset-daisy'
import { presetScrollbar } from 'unocss-preset-scrollbar'

export default defineConfig({
	rules:[
		['home-top-img',{background: 'url(https://hsiaofongw.notion.site/images/page-cover/rijksmuseum_jansz_1641.jpg) fixed 100%;'}],
		['slideIn',{animation: 'slide-in 1s ease-in-out 1 forwards;'}],
		['slide-underline',{content:'""',
			display:'block',
			width: '0%;',
			height: '4px;',
			background: 'gray;',
			transition: 'all 0.3s;'}],
		['keyframes-slide-in',{}]
	],
	exclude: [
		/uno.css/,
	],
	transformers: [
		transformerDirectives(),
	],
	presets: [
		presetDaisy(),
		presetUno(),
		presetAttributify({
			prefix: 'w-',
		}),
		presetTypography(),
		presetIcons(),
		presetWebFonts(),
		presetScrollbar(),
		presetHeroPatterns(),
	],
	shortcuts: [],
})
