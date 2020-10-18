import replace from '@rollup/plugin-replace';
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
	vueCustomBlockTransforms: {
	},
	optimizeDeps: {
		include: [
			'hast-to-hyperscript',
			'@wasmer/wasi',
			'@wasmer/wasmfs',
			'@wasmer/wasm-transformer',
			'@wasmer/wasi/lib/bindings/browser',
		],
	},
	transforms: [
		markdown(),
	],
	plugins: [
		voie({
			pagesDir: 'src/pages',
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
	],
	rollupInputOptions: {
		plugins: [
			replace({
				__buildEnv__: 'production',
			}),
		],
	},
} as UserConfig
