import type {Toc} from '@stefanprobst/rehype-extract-toc'
import type {PluggableList} from 'unified'
import type {Plugin} from 'vite'

import rehype_toc from '@stefanprobst/rehype-extract-toc'
import fs from 'fs/promises'
import rehype_slug from 'rehype-slug'
import remark_frontmatter from 'remark-frontmatter'
import remark_frontmatter_parse from 'remark-parse-frontmatter'
import path from 'upath'
import {createProcessor} from 'xdm'

export interface Meta {
	frontmatter?: Record<string, unknown>
	toc?: Toc
}

export interface Config {
	extensions: string[]
	defaultLayout: string
	remark: PluggableList
	rehype: PluggableList
	recma: PluggableList
}

export type UserConfig = Partial<Config>

export function NormalizeConfig(ucfg?: UserConfig) {
	return {
		extensions: ['.md'],
		defaultLayout: 'md',
		remark: [],
		rehype: [],
		recma: [],
		...ucfg,
	}
}

export function markdownParser(cfg: Config) {
	const parser = createProcessor({
		jsx: true,
		outputFormat: 'function-body',
		remarkPlugins: [
			remark_frontmatter,
			remark_frontmatter_parse,
			...cfg.remark,
		],
		rehypePlugins: [
			rehype_slug,
			rehype_toc,
			...cfg.rehype,
		],
		recmaPlugins: cfg.recma,
	})

	return async (content: string) => {
		const processed = await parser.process(content)
		const data = processed.data as Meta
		return `
import {h} from 'vue'

function MDX() {
${processed.toString().replace('<>', '<div>').replace('</>', '</div>')}
}

export default defineComponent({
	layout: '${data.frontmatter?.data ?? cfg.defaultLayout}',
	setup(_, {expose}) {
		const Content = MDX({}).default
		const updateMeta = inject('md_update_meta')
		if (updateMeta) updateMeta(${JSON.stringify(processed.data)})
		return () => <Content />
	}
})
`
	}
}

export function createPlugin(ucfg?: UserConfig): Plugin {
	const cfg = NormalizeConfig(ucfg)

	const parser = markdownParser(cfg)

	return {
		name: 'mdx',
		enforce: 'pre',
		async resolveId(id: string) {
			const p = path.parse(id)
			if (cfg.extensions.indexOf(p.ext) !== -1) {
				return `mdx:${path.join(p.dir, p.name)}.jsx`
			}
		},
		async load(id: string) {
			if (id.startsWith('mdx:')) {
				const p = path.parse(id.slice(4))
				const buf = await fs.readFile(`${path.join(p.dir, p.name)}.md`)
				return await parser(buf.toString())
			}
		}
	}
}
