import path from 'path'
import {UserConfig} from 'vite'
import svg from 'vite-plugin-svg'
import voie from 'vite-plugin-voie'

import markdown from './markdown'

const alias = {
	'/@/': path.join(__dirname, 'src'),
}

export default {
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
		markdown({posts: 'pages/posts'}),
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
	proxy: {
		'/api': {
			target: 'http://localhost:3001',
			ws: false,
			changeOrigin: true,
			rewrite: path => path.replace(/^\/api/, '')
		}
	}
} as UserConfig
