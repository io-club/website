import {createPlugin as mdvue} from '@ioclub/mdvue'
import {defineNuxtConfig} from 'nuxt3'
import icons from 'unplugin-icons/vite'
import windi from 'vite-plugin-windicss'

export default defineNuxtConfig({
	srcDir: 'src',
	extensions: ['.js', '.mjs', '.ts', '.tsx', '.vue', '.md'],
	serverMiddleware: [
		{path: '/api', handler: '~/api/index'},
	],
	vite: {
		envPrefix: 'IO_',
		plugins: [
			windi({
				root: __dirname,
			}),
			mdvue({}),
			icons({
				compiler: 'vue3',
			}),
		],
	},
})
