import node from '@astrojs/node'
import { defineConfig } from 'astro/config'
import UnoCSS from 'unocss/astro'
import lit from '@astrojs/lit'

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
		lit(),
	],
	vite: {
		optimizeDeps: {
			exclude: ['oslo'],
		},
	},
})
