import type {NuxtConfig} from '@nuxt/kit'

import {createPlugin as mdvue} from '@ioclub/mdvue'
import windi from 'vite-plugin-windicss'

export default <NuxtConfig>{
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
			mdvue({}),
		],
	},
}
