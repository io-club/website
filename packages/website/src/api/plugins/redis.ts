import type {FastifyPluginCallback} from 'fastify'
import type {ft_create_opt, ft_search_opt, Redis, ValueType} from 'ioredis'

import destr from 'destr'
import fp from 'fastify-plugin'
import {createPool} from 'generic-pool'
import IORedis, {Command} from 'ioredis'

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
		if (args.length === 2) {
			args.push('$')
		}
		return args
	})

	// json.set
	Command.setArgumentTransformer('json.set', function (args) {
		if (args.length === 2) {
			if (typeof args[1] !== 'string') {
				args.push(JSON.stringify(args[1]))
			}
			args[1] = '$'
		} else if (args.length === 3) {
			if (typeof args[2] !== 'string') {
				args[2] = JSON.stringify(args[2])
			}
		}
		return args
	})

	// ft.create json
	Command.setArgumentTransformer('ft.create', function (args) {
		if (args.length === 3) {
			if (args[0] === 'json') {
				const opt = args[1] as unknown as ft_create_opt

				const r: ValueType[] = [opt.name, 'on', 'json']

				if (opt.prefix)
					r.push('prefix', opt.prefix.length, ...opt.prefix)

				r.push('schema')
				for (const [x, [y, z]] of Object.entries(args[2]))
					r.push(x, 'as', y, z)

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
			return r
		}
		return args
	})
	Command.setReplyTransformer('ft.search', function (result) {
		const n = result[0] 
		const r: Record<string, unknown> = {}
		for (let i=0;i<n;i++) {
			r[result[2*i+1]] = [result[2*i+2][0], destr(result[2*i+2][1])]
		}
		return r
	})
}, {
	name: 'redis',
})

export default plugin
