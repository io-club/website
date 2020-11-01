import toMDXAST from '@mdx-js/mdx/md-ast-to-mdx-ast'
import mdxAstToMdxHast from '@mdx-js/mdx/mdx-ast-to-mdx-hast'
import mdxHastToJsx from '@mdx-js/mdx/mdx-hast-to-jsx'
import {Service, startService} from 'esbuild'
import {format as dateFormat} from 'fecha'
import globby from 'globby'
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

const Attributes = (value: string): Record<string, unknown> => {
	const attributes = toml.parse(value)
	if (attributes.last_modified) {
		attributes.last_modified = dateFormat(new Date(attributes.last_modified), 'YYYY-MM-DD hh:mm:ss')
	}
	if (!attributes.license) attributes.license = 'by-nc-nd'
	return attributes
}

export const Render = async (file: string): Promise<string> => {
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
					attributes = Attributes(node.value as string)
				})
				remove(tree, ['yaml', 'toml'])

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
	setup() {
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
			page.attr = ${JSON.stringify(attributes)}
			return MDXContent({})
		}
	},
})
`
	return result.js;
}

export interface Meta {
	path: string;
	data: Record<string, unknown>;
}

export const Pagination = async (posts: string): Promise<string> => {
	const meta: Meta[] = []
	const files = await globby('**/*.md', {cwd: posts})
	for (const file of files) {
		const path = `${posts}/${file}`
		let attributes: Record<string, unknown> = {}
		const remark = unified()
			.use(frontmatter)
			.use(markdown, {})
			.use(() => {
				return (tree) => {
					// extract frontmatter
					visit(tree, ['yaml', 'toml'], (node) => {
						attributes = Attributes(node.value as string)
					})
				}
			})
		await remark.run(remark.parse(vfile.readSync(path)))
		if (attributes.publish) {
			meta.push({
				path: file.replace(/.md$/, '').replace(/index$/, ''),
				data: attributes,
			})
		}
	}
	meta.sort((a, b) => {
		const ta = new Date(a.data.last_modified as string)
		const tb = new Date(b.data.last_modified as string)
		if (ta > tb) return -1
		else if (ta == tb) return 0
		else return 1
	})
	return `
import { defineComponent, inject, h } from 'vue'
export default defineComponent({
	setup(props) {
		const posts = inject('posts') || {}
		return () => {
			posts.meta = ${JSON.stringify(meta)}
			return h('div')
		}
	}
})
`
}

export const transform = ({posts = 'posts'}): Transform => {
	return {
		test: ({path}) => path.endsWith('.md'),
		transform: async ({path: file}) => {
			let result
			try {
				if (file.endsWith('pagination.md')) {
					result = await Pagination(posts)
				} else {
					result = await Render(file)
				}
			} catch (err) {
				console.error(err)
			}
			return {
				code: result || '',
			}
		}
	}
}

export default transform
