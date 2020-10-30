import toMDXAST from '@mdx-js/mdx/md-ast-to-mdx-ast'
import mdxAstToMdxHast from '@mdx-js/mdx/mdx-ast-to-mdx-hast'
import mdxHastToJsx from '@mdx-js/mdx/mdx-hast-to-jsx'
import {Service, startService} from 'esbuild'
import {format as dateFormat} from 'fecha'
import fs from 'fs'
import katex from 'rehype-katex'
import embeded from 'remark-embed-images'
import toc_extract from 'remark-extract-toc'
import footnotes from 'remark-footnotes'
import frontmatter from 'remark-frontmatter'
import gfm from 'remark-gfm'
import highlight from 'remark-highlight.js'
import math from 'remark-math'
import remarkMdx from 'remark-mdx'
import footnotes_numberd from 'remark-numbered-footnote-labels'
import pangu from 'remark-pangu'
import markdown from 'remark-parse'
import sectionize from 'remark-sectionize'
import slug from 'remark-slug'
import {Item} from 'src/components/nested-menu';
import vfile from 'to-vfile'
import toml from 'toml'
import unified from 'unified'
import remove from 'unist-util-remove'
import visit from 'unist-util-visit'
import {Transform} from 'vite'

import footnotes_mulref from './mulref'

let esbuild: Promise<Service> | undefined

const ensureService = async () => {
	if (!esbuild) {
		esbuild = startService()
	}
	return esbuild
}

export const stopService = async () => {
	if (esbuild) {
		const service = await esbuild
		service.stop()
		esbuild = undefined
	}
}

const test = (path: string) => path.endsWith('.md');

const render = async (file: string) => {
	let attributes: Record<string, unknown> = {}
	let tableOfContents: Record<string, unknown> = {}
	const remark = unified()
		.use(frontmatter)
		.use(markdown, {})
		.use(remarkMdx)
		.use(toMDXAST)
		.use(gfm, {})
		.use(slug)
		.use(footnotes, {inlineNotes: true})
		.use(footnotes_numberd)
		.use(footnotes_mulref)
		.use(sectionize)
		.use(pangu)
		.use(embeded)
		.use(math)
		.use(highlight)
		.use(() => {
			return (tree) => {
				// extract frontmatter
				visit(tree, ['yaml', 'toml'], (node) => {
					attributes = toml.parse(node.value as string)
				})
				remove(tree, ['yaml', 'toml'])

				const descs = attributes.descs
				if (descs && descs instanceof Array) {
					for (const desc of descs) {
						if (desc.label == 'last_modified') {
							const stats = fs.statSync(file)
							desc.value = dateFormat(stats.mtime, 'YYYY-MM-DD hh:mm:ss A')
						}
					}
				}

				// extract toc
				let toc1: unknown = toc_extract({keys: ['data']})(tree)

				if (toc1 instanceof Array) {
					toc1 = {depth: 0, children: toc1}
				}

				interface TocEntry {
					depth: number;
					data?: Record<string, unknown>;
					value: string;
					children: TocEntry[];
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

				const toc2 = tocTrans(toc1 as TocEntry)
				if (toc2.children) {
					tableOfContents = toc2.children
				}
			}
		}).use(mdxAstToMdxHast)
		.use(katex, {
			output: 'html',
			macros: {
				'\\cal': '\\mathcal{#1}',
				'\\scr': '\\mathscr{#1}',
				'\\bb': '\\mathbb{#1}',
				'\\bf': '\\mathbf{#1}',
			},
		})
		.use(mdxHastToJsx)

	const jsx = await remark.process(vfile.readSync(file))
	const result = await (await ensureService()).transform(`${jsx.contents}`, {
		loader: 'jsx',
		sourcemap: true,
		sourcefile: jsx.path,
		target: 'es2020',
		jsxFactory: 'vnode',
	})
	result.js = result.js.replace('export default function MDXContent', 'const MDXContent = function')
	result.js = `
import { defineComponent, inject, isVNode, createVNode, h } from 'vue'
import { useRouter } from 'vue-router'

const defaults = {inlineCode: 'code', wrapper: 'div'}
const slice = Array.prototype.slice

export default defineComponent({
	setup(props) {
		const router = useRouter()
		const page = inject('page') || {}
		const registerComponent = inject('components') || {}
		const vnode = function (tag, props, children) {
			if (registerComponent[tag]) {
				tag = registerComponent[tag]
			}
			if (defaults[tag]) {
				tag = defaults[tag]
			}
			if (arguments.length > 3 || isVNode(children)) {
				children = slice.call(arguments, 2)
			}
			return createVNode(tag, props, children)
		}
		${result.js}
		return () => {
			page.toc = ${JSON.stringify(tableOfContents)}
			page.attributes = ${JSON.stringify(attributes)}
			return MDXContent({})
		}
	},
})
`
	return result;
}

export const transform = (): Transform => {
	return {
		test: ({path: file}) => test(file),
		transform: async ({path: file}) => {
			const result = await render(file)
			return {
				code: result.js,
			}
		}
	}
}

export default transform
