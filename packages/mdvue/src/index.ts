import type {Element, Root} from 'hast'
import type {Options as hastStringifyOptions} from 'hast-util-to-html'
import type {Options as toRehypeOptions} from 'mdast-util-to-hast'
import type {Processor, Transformer} from 'unified'

import fs from 'fs'
import rehype_parse from 'rehype-parse'
import rehype_stringify from 'rehype-stringify'
import remark_parse from 'remark-parse'
import remark2rehype from 'remark-rehype'
import {unified} from 'unified'
import {visit} from 'unist-util-visit'
import {createUnplugin} from 'unplugin'
import path from 'upath'

export interface Config {
	extensions: string[];
	mdastConfig: (a: Processor) => Processor;
	hastConfig: (a: Processor) => Processor;
	toHast: toRehypeOptions;
	hastStringify: hastStringifyOptions;
}

export interface UserConfig {
	extensions?: string[];
	mdastConfig?: (a: Processor) => Processor;
	hastConfig?: (a: Processor) => Processor;
	mdastToHast?: toRehypeOptions;
	hastStringify?: hastStringifyOptions;
}

export function NormalizeConfig(ucfg?: UserConfig) {
	const r: Config = {
		extensions: ['.md'],
		mdastConfig: (a) => a,
		hastConfig: (a) => a,
		toHast: {},
		hastStringify: {},
	}

	if (ucfg) {
		if (ucfg.extensions && ucfg.extensions.length > 0)
			r.extensions = ucfg.extensions
		if (ucfg.mdastConfig)
			r.mdastConfig = ucfg.mdastConfig
		if (ucfg.hastConfig)
			r.hastConfig = ucfg.hastConfig
		if (ucfg.extensions)
			r.extensions = ucfg.extensions
		if (ucfg.mdastToHast)
			r.toHast = ucfg.mdastToHast
		if (ucfg.hastStringify)
			r.hastStringify = ucfg.hastStringify
	}

	return r
}

export function markdownParser(cfg: Config) {
	const blockParser = unified().use(rehype_parse, {fragment: true})

	const parser1 = unified()
		.use(remark_parse)

	const parser2 = cfg.mdastConfig(parser1)
		.use(remark2rehype, {
			...cfg.toHast,
			allowDangerousHtml: true,
		})
		.use((): Transformer => {
			return (tree) => {
				const hast = tree as Element

				let scriptCount = 0
				let styleCount = 0
				let script: Element | undefined
				let style: Root | undefined

				visit(hast, 'raw', (n, i, p) => {
					if (!i) return

					const rootBlock = blockParser.parse(n.value)
					if (rootBlock && rootBlock.children[0]) {
						const block = rootBlock.children[0] as Element
						if (block.tagName === 'script') {
							if (scriptCount++ > 0) {
								return false
							}
							script = block
							p?.children.splice(i, 1)
						} else if (block.tagName === 'style') {
							if (styleCount++ > 0) {
								return false
							}
							style = rootBlock
							p?.children.splice(i, 1)
						}
					}
				})
				if (scriptCount > 1) {
					throw 'more than one script block'
				}
				if (styleCount > 1) {
					throw 'more than one style block'
				}

				const children = []

				if (script)
					children.push(script)

				if (style)
					children.push(style)

				children.push({type: 'element', tagName: 'layout', children: hast.children})

				return {type: 'root', children}
			}
		})

	const parser3 = cfg.hastConfig(parser2)
		.use(rehype_stringify, {
			...cfg.hastStringify,
			allowDangerousHtml: true,
		})

	return async (content: string) => {
		const processed = await parser3.process(content)
		const ret = processed.toString()
			.replace(/<layout>/g, '<template>')
			.replace(/<\/layout>/g, '</template>')
		return ret
	}
}

export const createPlugin = createUnplugin(function (ucfg?: UserConfig) {
	const cfg = NormalizeConfig(ucfg)

	const parser = markdownParser(cfg)

	return {
		name: 'mdvue',
		async resolveId(id) {
			const p = path.parse(id)
			if (cfg.extensions.indexOf(p.ext) !== -1) {
				return `mdvue:${path.join(p.dir, p.name)}.vue`
			}
		},
		async load(id) {
			if (id.startsWith('mdvue:')) {
				const p = path.parse(id.slice(6))
				const buf = fs.readFileSync(`${path.join(p.dir, p.name)}.md`)
				return await parser(buf.toString())
			}
		}
	}
})
