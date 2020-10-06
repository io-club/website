import Frontmatter from 'front-matter'
import MarkdownIt from 'markdown-it'
import {Transform} from 'vite'
import {parseDOM, DomUtils} from 'htmlparser2'
import {Element} from 'domhandler'

const test = (path: string) => path.endsWith('.md');

const render = (code: string, options: MarkdownIt.Options) => {
	const fm = Frontmatter<unknown>(code)

	const html = MarkdownIt(options).render(fm.body)

	const indicies = parseDOM(html).filter(
		rootSibling => rootSibling instanceof Element && ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(rootSibling.tagName)
	) as Element[]

	const toc: {level: string; content: string}[] = indicies.map(index => ({
		level: index.tagName.replace('h', ''),
		content: DomUtils.getText(index),
	}))

	return {attributes: fm.attributes, toc, html}
}

export const transform = (options: MarkdownIt.Options): Transform => {
	return {
		test: ({path}) => test(path),
		transform: ({code}) => {
			const {attributes, toc, html} = render(code, options)
			return {
				code: `
import { defineComponent, h } from "vue";
export default defineComponent({
	props: [
		'toc',
		'attributes',
	],
	created() {
		this.$emit('update:toc', ${JSON.stringify(toc)})
		this.$emit('update:attributes', ${JSON.stringify(attributes)})
	},
	render() {
		return h('div', {innerHTML: \`${html}\`})
	},
})
`,
			}
		}
	}
}

export default transform
