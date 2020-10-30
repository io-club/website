import path from 'path'
import {UserConfig} from 'vite'
import svg from 'vite-plugin-svg'
import voie from 'vite-plugin-voie'

import {transform as markdown} from './lib/markdown'

const alias = {
	'/@/': path.join(__dirname, 'src'),
}

export default {
	mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
	alias,
	sourcemap: true,
	cssPreprocessOptions: {
		less: {
			paths: ['src'],
			javascriptEnabled: true,
		},
	},
	esbuildTarget: 'es2018',
	minify: 'esbuild',
	transforms: [
		markdown(),
	],
	plugins: [
		voie({
			pagesDir: 'pages',
			extensions: ['vue', 'md'],
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
