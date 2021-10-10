import type {NuxtConfig} from '@nuxt/kit'

import {createPlugin as mdvue} from '@ioclub/mdvue'
import icons from 'unplugin-icons/vite'

export default <NuxtConfig>{
	srcDir: 'src',
	extensions: ['.js', '.mjs', '.ts', '.tsx', '.vue', '.md'],
	serverMiddleware: [
		{path: '/api', handler: '~/api/index'},
	],
	vite: {
		plugins: [
			mdvue({}),
			icons({
				compiler: 'vue3',
			}),
		],
	},
}
