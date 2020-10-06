import voie from 'vite-plugin-voie'
import components from 'vite-plugin-components'
import icon from 'vite-plugin-purge-icons'
import i18n from '@intlify/vite-plugin-vue-i18n'
import {transform as markdown} from './lib/markdown'
import {UserConfig} from 'vite'
import path from 'path'

const alias = {
	'/posts/': path.join(__dirname, 'posts'),
}

export const markdownOptions = {
}

export default {
	mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
	alias,
	vueCustomBlockTransforms: {
		i18n,
	},
	transforms: [
		markdown(markdownOptions),
	],
	plugins: [
		voie({
			pagesDir: 'src/pages',
			extensions: ['vue', 'js', 'ts', 'md'],
		}),
		components({
			alias,
			dirs: ['src/components'],
			extensions: ['vue'],
			deep: true,
		}),
		icon(),
	],
} as UserConfig
