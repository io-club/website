import {format as dateFormat} from 'fecha'
import fs from 'fs'
import parse from 'gray-matter'
import {get, set} from 'lodash'
import hash from 'object-hash'
import path from 'path'
import katex from 'rehype-katex'
import collapse from 'remark-collapse'
import embeded from 'remark-embed-images'
import toc_extract from 'remark-extract-toc'
import footnotes from 'remark-footnotes'
import gfm from 'remark-gfm'
import highlight from 'remark-highlight.js'
import math from 'remark-math'
import footnotes_numberd from 'remark-numbered-footnote-labels'
import markdown from 'remark-parse'
import remark2rehype from 'remark-rehype'
import sectionize from 'remark-sectionize'
import slug from 'remark-slug'
import {Item} from 'src/components/nested-menu';
import toml from 'toml'
import unified from 'unified'
import visit from 'unist-util-visit'
import {Transform} from 'vite'

import footnotes_mulref from './mulref'

declare interface TocEntry {
	depth: number;
	data?: Record<string, unknown>;
	value: string;
	children: TocEntry[];
}

const test = (path: string) => path.endsWith('.md');

const render = async (code: string, file: string) => {
	const fm = parse(code, {
		language: 'toml',
		engines: {
			toml: toml.parse.bind(toml)
		},
	})
	const descs = fm.data['descs']
	for (const desc of descs) {
		if (desc.label == 'last_modified') {
			const stats = fs.statSync(file)
			desc.value = dateFormat(stats.mtime, 'YYYY-MM-DD hh:mm:ss A')
		}
	}

	const remark = unified()
		.use(markdown, {})
		.use(gfm, {})
		.use(collapse, {test: 'tango'})
		.use(slug)
		.use(footnotes, {inlineNotes: true})
		.use(footnotes_numberd)
		.use(footnotes_mulref)
		.use(sectionize)
		.use(embeded)
		.use(math)
		.use(highlight)

	const vf = {
		cwd: path.dirname(file),
		path: file,
		contents: fm.content,
	}

	const mast = await remark.run(remark.parse(vf), vf)

	let tocs: unknown = await unified().use(toc_extract, {keys: ['data']}).run(mast)

	if (tocs instanceof Array) {
		tocs = {depth: 0, value: fm.data.title, children: tocs}
	}

	const tocTrans = (p: TocEntry): Item => {
		const children: Record<string, Item> = {}
		for (const v of p.children) {
			children[v.value] = tocTrans(v)
		}
		return {
			href: `#${p.data?.id || p.value}`,
			label: p.value,
			children: children,
			type: p.children.length ? 'sub' : undefined,
		}
	}

	tocs = tocTrans(tocs as TocEntry).children

	const hast = await unified()
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
		}).run(mast)

	visit(hast, 'element', (node) => {
		if (node.tagName !== 'code') return
		set(node, 'properties.id', hash(node))
		const lang = get(node, 'properties.className') as string[]
		if (!lang || !lang.length || lang.length < 1) return
		set(node, 'properties.language', lang[0].replace('language-', ''))
	})

	return {attributes: fm.data, tocs, hast}
}

export const transform = (): Transform => {
	return {
		test: ({path: file}) => test(file),
		transform: async ({code, path: file}) => {
			const {attributes, tocs, hast} = await render(code, file)
			return {
				code: `
import { defineComponent, reactive, h, withModifiers, inject } from 'vue'
import { useRouter } from 'vue-router'
import toH from 'hast-to-hyperscript'

export default defineComponent({
	setup(props, {emit}) {
		const router = useRouter()
		const hast = ${JSON.stringify(hast)}

		const page = inject('page') || {}
		return () => {
			page.toc = ${JSON.stringify(tocs)}
			page.attributes = ${JSON.stringify(attributes)}
			const ret = toH((e, p, c) => {
				if (p && p.class) {
					if (p.class.includes('footnote-ref')) {
						p.onClick = withModifiers(() => router.push(p.href), ['stop', 'prevent'])
					} else if (p.class.includes('footnote-backref')) {
						p.onClick = withModifiers(() => router.back(), ['stop', 'prevent'])
					}
				}
				return h(e, p, c)
			}, hast)
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
