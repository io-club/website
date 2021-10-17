import type {JTDParser} from '~/alias/jtd'
import type {FastifyInstance} from 'fastify'
import type {Pipeline, Redis} from 'ioredis'

import {join} from 'pathe'

export interface ConstructorOptions<T> {
	redis: FastifyInstance['redis']
	prefix: string
	parser: JTDParser<T>
	serializer: (a: T) => string
}

export type TransactionHandler = (redis: Pipeline) => Promise<void>
export interface TransactionOption<T> {
	handler: (redis: Pipeline, values?: T) => Promise<void>
	precheck?: (redis: Redis) => Promise<boolean>
	query?: (redis: Redis) => Promise<T>
	watch?: string[]
}

export type QueryHandler = (redis: Pipeline) => Promise<void>

export class BaseRepository<T> {
	#redis: ConstructorOptions<T>['redis']
	#prefix: ConstructorOptions<T>['prefix']
	#parser: JTDParser<T>
	#serializer: (a: T) => string

	constructor(opts: ConstructorOptions<T>) {
		this.#redis = opts.redis
		this.#prefix = opts.prefix
		this.#parser = opts.parser
		this.#serializer = opts.serializer
	}

	async init() {
		await this.create_index()
		return this
	}

	async create_index() {
		return
	}

	index() {
		return join(this.#prefix, 'index')
	}

	data(...d: string[]) {
		return join(this.#prefix, 'data', ...d)
	}

	txn() {
		return join(this.#prefix, 'txn')
	}

	parse(json: string) {
		const v = this.#parser(json)
		if (!v) throw new Error(`${this.#parser.message} at ${this.#parser.position}
${json}`)
		return v
	}

	serialize(data: T) {
		return this.#serializer(data)
	}

	async transaction<M>(_opt: TransactionHandler | TransactionOption<M>) {
		const isHandler = typeof _opt === 'function'
		let opt
		if (!isHandler) {
			opt = {
				handler: _opt.handler,
				watch: _opt.watch ?? [this.txn()],
				query: _opt.query,
				precheck: _opt.precheck,
			}
		} else {
			opt = {
				watch: [this.txn()],
				handler: _opt,
			}
		}

		const redis = await this.#redis.acquire()
		try {
			await redis.watch(...opt.watch)

			if (opt.precheck) {
				if (!await opt.precheck(redis)) return []
			}

			let values
			if (opt.query) {
				values = await opt.query(redis)
			}

			const pipe = redis.multi()
			await opt.handler(pipe, values)
			if (isHandler) pipe.incr(opt.watch[0])
			const res = await pipe.exec()

			const ret = []
			for (const [err,v] of res) {
				if (err) throw new Error(`can not complete transaction ${err}`)
				ret.push(v)
			}
			return ret
		} finally {
			await redis.unwatch()
			await this.#redis.release(redis)
		}
	}

	async query(handler: QueryHandler) {
		const redis = await this.#redis.acquire()
		try {
			const pipe = redis.pipeline()
			await handler(pipe)
			const res = await pipe.exec()
			const ret = []
			for (const [err,v] of res) {
				if (err) throw new Error(`can not delete entity ${err}`)
				ret.push(v)
			}
			return ret
		} finally {
			await this.#redis.release(redis)
		}
	}
}
