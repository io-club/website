import {createPlugin as mdvue} from '@ioclub/mdvue'
import {defineNuxtConfig} from '@nuxt/kit'
import windi from 'vite-plugin-windicss'

export default defineNuxtConfig({
	srcDir: 'src',
	extensions: ['.js','.mjs','.ts','.tsx','.vue', '.md'],
	serverMiddleware: [
		{path: '/api', handler: '~/api/index'},
	],
	nitro: {
	},
	vite: {
		plugins: [
			windi({}),
			mdvue.vite({}),
		],
	},
})
