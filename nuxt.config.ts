import {defineNuxtConfig} from '@nuxt/kit'
import windi from 'vite-plugin-windicss'

export default defineNuxtConfig({
	srcDir: 'src',
	modules: [
		//'~/api',
	],
	nitro: {
	},
	vite: {
		plugins: [
			windi({}),
		],
	},
})
