import node from '@astrojs/node'
import { defineConfig } from 'astro/config'
import UnoCSS from 'unocss/astro'
import qwikdev from '@qwikdev/astro'

// https://astro.build/config
export default defineConfig({
	output: 'server',
	adapter: node({
		mode: 'standalone',
	}),
	i18n: {
		defaultLocale: 'en',
		locales: ['es', 'zh-CN', 'en', 'fr'],
	},
	integrations: [
		UnoCSS({
			injectReset: true,
		}),
		qwikdev(),
	],
	vite: {
		optimizeDeps: {
			exclude: ['oslo'],
		},
	},
})
