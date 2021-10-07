import type {FastifyPluginCallback} from 'fastify'
import type {ft_create_arg, ft_create_opt, ft_search_opt, Redis, ValueType} from 'ioredis'

import fp from 'fastify-plugin'
import {createPool} from 'generic-pool'
import IORedis, {Command} from 'ioredis'

export function escapeTag(tag: string) {
	return tag.replace(/[ \t,./(){}[]:;\\~!@#$%^&*-=%+|'`"<>%?_%z]/g, '\\$&')
}

export interface Config {
	url: string
}

const plugin: FastifyPluginCallback<Config> = fp(async function (fastify, options) {
	const pool = createPool<Redis>({
		async create() {
			const redis = new IORedis(options.url)
			redis.addBuiltinCommand('json.set')
			redis.addBuiltinCommand('json.get')
			redis.addBuiltinCommand('ft.create')
			redis.addBuiltinCommand('ft.search')
			redis.addBuiltinCommand('ft.dropindex')
			return redis
		},
		async destroy(client) {
			client.disconnect()
		},
	}, {
		max: 10,
		min: 3,
	})

	fastify.decorate('redis', pool)

	// json.get
	Command.setArgumentTransformer('json.get', function (args) {
		return args
	})

	// json.set
	Command.setArgumentTransformer('json.set', function (args) {
		if (args.length === 3) {
			if (typeof args[2] !== 'string') {
				args[2] = JSON.stringify(args[2])
			}
		}
		return args
	})

	// ft.create json
	Command.setArgumentTransformer('ft.create', function (args) {
		if (args.length >= 2) {
			if (args[0] === 'json') {
				const opt = args[1] as unknown as ft_create_opt

				const r: ValueType[] = [opt.name, 'on', 'json']

				if (opt.prefix)
					r.push('prefix', opt.prefix.length, ...opt.prefix)

				r.push('schema')

				for (const v of args.slice(2)) {
					const e = v as unknown as ft_create_arg
					if (e instanceof Array) {
						r.push(e[0], e[1])
					} else {
						r.push(e.ident)
						if (e.as)
							r.push('as', e.as)
						r.push(e.type)
						if (e.separator)
							r.push('SEPARATOR', e.separator)
						if (e.case_sensitive)
							r.push('CASESENSITIVE')
					}
				}

				return r
			}
		}
		return args
	})

	// ft.search
	Command.setArgumentTransformer('ft.search', function (args) {
		if (args.length >= 2) {
			// TODO: make use of search opts
			// @ts-ignore
			const opt: ft_search_opt = args.length === 3 ? args[2] as unknown : {}
			const r = []
			r.push(args[0], args[1])
			if (opt.return) {
				if (typeof opt.return === 'string')
					r.push('return', 1, opt.return)
				else
					r.push('return', 3, opt.return[0], 'as', opt.return[1])
			}
			return r
		}
		return args
	})
	Command.setReplyTransformer('ft.search', function (result) {
		const n = result[0] 
		const r: Record<string, unknown> = {}
		for (let i=0;i<n;i++) {
			r[result[2*i+1]] = [result[2*i+2][0], result[2*i+2][1]]
		}
		return r
	})

	// ft.dropindex
	Command.setArgumentTransformer('ft.dropindex', function (args) {
		if (args.length == 2 && args[1]) args[1] = 'dd'
		return args
	})
}, {
	name: 'redis',
})

export default plugin
