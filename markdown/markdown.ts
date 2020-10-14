import parse from 'gray-matter'
import {get, set} from 'lodash'
import hash from 'object-hash'
import path from 'path'
import katex from 'rehype-katex'
import embeded from 'remark-embed-images'
import toc_extract from 'remark-extract-toc'
import footnotes from 'remark-footnotes'
import highlight from 'remark-highlight.js'
import math from 'remark-math'
import footnotes_numberd from 'remark-numbered-footnote-labels'
import markdown from 'remark-parse'
import remark2rehype from 'remark-rehype'
import sectionize from 'remark-sectionize'
import slug from 'remark-slug'
import {TocEntry} from 'src/components/toc'
import unified from 'unified'
import visit from 'unist-util-visit'
import {Transform} from 'vite'

import footnotes_mulref from './mulref'

const test = (path: string) => path.endsWith('.md');

const render = async (code: string, file: string) => {
	const fm = parse(code)

	const remark = unified()
		.use(markdown, {})
		.use(slug)
		.use(footnotes, {inlineNotes: true})
		.use(footnotes_numberd)
		.use(footnotes_mulref)
		.use(sectionize)
		.use(embeded)
		.use(math)
		.use(highlight)

	const rehype = unified()
		.use(remark2rehype, {
			allowDangerousHtml: true,
			handlers: {
			},
		})
		.use(katex, {
			output: 'html',
			macros: {
				'\\cal': '\\mathcal{#1}',
				'\\scr': '\\mathscr{#1}',
				'\\bb': '\\mathbb{#1}',
				'\\bf': '\\mathbf{#1}',
			},
		})

	const vf = {
		cwd: path.dirname(file),
		path: file,
		contents: fm.content,
	}

	const mast = await remark.run(remark.parse(vf), vf)

	let tocs: unknown = await unified().use(toc_extract).run(mast)

	if (tocs instanceof Array) {
		tocs = {depth: 0, value: fm.data.title, children: tocs}
	}

	const hast = await rehype.run(mast)

	visit(hast, 'element', (node) => {
		if (node.tagName !== 'code') return
		set(node, 'properties.id', hash(node))
		const lang = get(node, 'properties.className') as string[]
		if (!lang || !lang.length || lang.length < 1) return
		set(node, 'properties.language', lang[0].replace('language-', ''))
	})

	const uuid = (p: TocEntry) => {
		p.uuid = hash(p)
		if (p.children) {
			p.children.forEach(v => uuid(v))
		}
		return p
	}
	uuid(tocs as TocEntry)

	return {attributes: fm.data, tocs, hast}
}

export const transform = (): Transform => {
	return {
		test: ({path: file}) => test(file),
		transform: async ({code, path: file}) => {
			const {attributes, tocs, hast} = await render(code, file)
			return {
				code: `
import { defineComponent, reactive, h, withModifiers, onBeforeMount } from 'vue'
import { useRouter } from 'vue-router'
import toH from 'hast-to-hyperscript'

export default defineComponent({
	props: [
		'onUpdate:toc',
		'onUpdate:attributes',
		'onUpdate:codeblocks',
	],
	setup(props) {
		const router = useRouter()
		const hast = ${JSON.stringify(hast)}
		props['onUpdate:toc'](${JSON.stringify(tocs)})
		props['onUpdate:attributes'](${JSON.stringify(attributes)})
		return () => {
			const blocks = []
			const ret = toH((e, p, c) => {
				if (p && p.class) {
					if (p.class.includes('footnote-ref')) {
						p.onClick = withModifiers(() => router.push(p.href), ['stop', 'prevent'])
					} else if (p.class.includes('footnote-backref')) {
						p.onClick = withModifiers(() => router.back(), ['stop', 'prevent'])
					}
				}
				if (e === 'code') {
					blocks.push(p.id)
				}
				return h(e, p, c)
			}, hast)
			props['onUpdate:codeblocks'](blocks)
			return ret
		}
	},
})
`,
			}
		}
	}
}

export default transform
