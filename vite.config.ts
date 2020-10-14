import path from 'path'
import {UserConfig} from 'vite'
import svg from 'vite-plugin-svg'
import voie from 'vite-plugin-voie'

import {transform as markdown} from './markdown/markdown'

const alias = {
	'/@/': path.join(__dirname, 'src'),
}

const languages = ['clike', 'javascript', 'python']

export default {
	mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
	alias,
	vueCustomBlockTransforms: {
	},
	optimizeDeps: {
		include: ['hast-to-hyperscript',
			...languages.map(e => `codemirror/mode/${e}/${e}`),
		],
	},
	transforms: [
		markdown(),
	],
	plugins: [
		voie({
			pagesDir: 'src/pages',
			extensions: ['vue', 'jsx', 'tsx', 'md'],
		}),
		svg({
			svgoConfig: {
				plugins: [{
					removeDimensions: true,
				}, {
					removeViewBox: false,
				}],
			},
		}),
	],
} as UserConfig
