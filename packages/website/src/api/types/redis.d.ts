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
		return?: string | [string, string]
	}
	interface ft_create_arg_full {
		ident: string
		type: 'text' | 'tag' | 'geo' | 'numeric'
		as?: string
		case_sensitive?: boolean
		separator?: string
	}
	type ft_create_arg = [string,'text' | 'tag' | 'geo' | 'numeric'] | ft_create_arg_full
	interface Commands {
		'json.set'(name: string, path: string, value: string | unknown, ...props: ('nx' | 'xx')[]): Promise<'OK'>
		'json.get'<T = Record<string, unknown>>(key: string, path?: string): Promise<T>
		'ft.create'(typ: 'json', opts: ft_create_opt, ...args: ft_create_arg[]): Promise<'OK'>
		'ft.search'(name: string, filter: string, opts?: ft_search_opt): Promise<Record<string, [string, string]>>
		'ft.dropindex'(name: string, dd?: boolean): Promise<'OK'>
		'ft.info'(name: string): Promise<'unknown'>
	}
	interface Pipeline {
		'json.set'(...arg: Parameters<Commands['json.set']>): Pipeline
		'json.get'(...arg: Parameters<Commands['json.get']>): Pipeline
		'ft.create'(...arg: Parameters<Commands['ft.create']>): Pipeline
		'ft.search'(...arg: Parameters<Commands['ft.search']>): Pipeline
		'ft.dropindex'(...arg: Parameters<Commands['ft.dropindex']>): Pipeline
		'ft.info'(...arg: Parameters<Commands['ft.info']>): Pipeline
	}
}
