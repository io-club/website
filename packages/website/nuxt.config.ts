import {createPlugin as mdvue} from '@ioclub/vite-mdvue'
import {defineNuxtConfig} from '@nuxt/kit'
import windi from 'vite-plugin-windicss'

export default defineNuxtConfig({
	srcDir: 'src',
	extensions: ['.js','.mjs','.ts','.tsx','.vue', '.md'],
	modules: [
		'~/api',
	],
	nitro: {
	},
	vite: {
		plugins: [
			windi({}),
			mdvue({}),
		],
	},
})
