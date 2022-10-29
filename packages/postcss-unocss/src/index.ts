import type { SourceCodeTransformerEnforce, UnocssPluginContext, UserConfig } from '@unocss/core'
import type { Transformer } from 'postcss'

import { cyan, dim, green } from 'colorette'
import consola from 'consola'
import FastGlob from 'fast-glob'
import { existsSync } from 'node:fs'
import fs from 'node:fs/promises'
import { basename, dirname, relative, resolve } from 'node:path'
import { debounce } from 'perfect-debounce'

import { createContext } from './context'
import { applyTransformers } from './transform'

interface Options extends Omit<UserConfig, 'cli'> {
	patterns: string[]
	outFile?: string
	minify?: boolean
	preflight?: boolean
	watch?: boolean
}

async function build(ctx: UnocssPluginContext, options: Options) {
	const fileCache = new Map<string, string>()

	const cwd = process.cwd()

	const files = await FastGlob(options.patterns, { cwd, absolute: true })
	await Promise.all(
		files.map(async (file) => {
			fileCache.set(file, await fs.readFile(file, 'utf8'))
		}),
	)

	const debouncedBuild = debounce(
		async () => {
			async function transformFiles(sources: { id: string; code: string; }[], enforce: SourceCodeTransformerEnforce = 'default') {
				const ret = []
				for (const v of sources) {
					const r = await applyTransformers(ctx, v.code, v.id, enforce)
					ret.push({ id: v.id, code: r?.code ?? v.code })
				}
				return ret
			}

			const sourceCache = Array.from(fileCache).map(([id, code]) => ({ id, code }))

			const outFile = resolve(cwd, options.outFile ?? 'uno.css')

			const preTransform = await transformFiles(sourceCache, 'pre')
			const defaultTransform = await transformFiles(preTransform)
			const postTransform = await transformFiles(defaultTransform, 'post')

			const { css, matched } = await ctx.uno.generate(
				postTransform.map(({ code }) => code).join('\n'),
				{
					preflights: options.preflight,
					minify: options.minify,
				},
			)

			const dir = dirname(outFile)
			if (!existsSync(dir)) await fs.mkdir(dir, { recursive: true })
			await fs.writeFile(outFile, css, 'utf-8')
			if (!options.watch) {
				consola.success(
					`${[...matched].length} utilities generated to ${cyan(
						relative(cwd, outFile),
					)}\n`,
				)
			}
		},
		100,
	)

	await debouncedBuild()

	if (!options.watch)
		return

	const { watch } = await import('chokidar')
	const { patterns } = options
	const ignored = ['**/{.git,node_modules}/**']

	const watcher = watch(patterns, {
		ignoreInitial: true,
		ignorePermissionErrors: true,
		ignored,
		cwd,
	})

	const configSources = (await ctx.updateRoot(cwd)).sources
	if (configSources.length) watcher.add(configSources)

	watcher.on('all', async (type, file) => {
		const absolutePath = resolve(cwd, file)

		if (configSources.includes(absolutePath)) {
			await ctx.reloadConfig()
			consola.info(`${cyan(basename(file))} changed, setting new config`)
		}
		else {
			consola.log(`${green(type)} ${dim(file)}`)

			if (type.startsWith('unlink'))
				fileCache.delete(absolutePath)
			else
				fileCache.set(absolutePath, await fs.readFile(absolutePath, 'utf8'))
		}

		debouncedBuild()
	})

	consola.info(
		`Watching for changes in ${patterns
			.map(i => cyan(i))
			.join(', ')}`,
	)
}

export default function(opts: Options): Transformer {
	const ctx = createContext(opts)

	build(ctx, opts)

	const process: Transformer = async (root, result) => {
		const _input = root.source?.input
		if (!_input) return

		const { css } = _input
		let file = _input.file
		if (!file) file = 'a.css'

		let res: { code: string } = { code: css }
		res = (await applyTransformers(ctx, css, file, 'pre')) ?? res
		res = (await applyTransformers(ctx, css, file, 'default')) ?? res
		res = (await applyTransformers(ctx, css, file, 'post')) ?? res

		result.css = res.code
	}

	process.postcssPlugin = 'postcss-unocss'
	process.postcssVersion = '0.1.0'
	return process
}
