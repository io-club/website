import type {Pool} from 'generic-pool'
import type {Redis} from 'ioredis'

import 'fastify'

declare module 'fastify' {
	interface FastifyInstance {
		redis: Pool<Redis>
	}
}

declare module 'ioredis' {
	interface Commander {
		addBuiltinCommand(commandName: string): void
	}
	interface ft_create_opt {
		name: string
		prefix?: string[]
	}
	interface ft_search_opt {
	}
	interface Commands {
		'json.set'(name: string, value: string | unknown): Promise<'OK' | null>
		'json.set'(name: string, path: string, value: string | unknown): Promise<'OK' | null>
		'json.get'<T = Record<string, unknown>>(name: string, ...path: string[]): Promise<T>
		'ft.create'(typ: 'json', opts: ft_create_opt, args: Record<string, [string,'text' | 'tag' | 'geo' | 'numeric']>): Promise<'OK'>
		'ft.search'<T = unknown>(name: string, filter: string, opts?: ft_search_opt): Promise<Record<string, [string, T]>>
	}
	interface Pipeline {
		'json.set'(name: string, value: string | unknown): Pipeline
		'json.set'(name: string, path: string, value: string | unknown): Pipeline
		'json.get'(name: string, ...path: string[]): Pipeline
		'ft.create'(typ: 'json', opts: ft_create_opt, args: Record<string, [string,'text' | 'tag' | 'geo' | 'numeric']>): Pipeline
		'ft.search'(name: string, filter: string, opts?: ft_search_opt): Pipeline
	}
}
