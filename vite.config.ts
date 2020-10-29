import path from 'path'
import {UserConfig} from 'vite'
//import legacyPlugin from 'vite-plugin-legacy'
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
	optimizeDeps: {
		include: ['hast-to-hyperscript'],
	},
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
			extensions: ['vue', 'tsx', 'md'],
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
		/*
		legacyPlugin({
			targets: [
				'since 2015',
			],
			polyfills: [],
			ignoreBrowserslistConfig: true,
			corejs: false,
		})
		*/
	],
} as UserConfig
