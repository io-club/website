import type {JTDParser} from '~/alias/jtd'
import type {FastifyInstance} from 'fastify'
import type {Redis} from 'ioredis'

import {join} from 'pathe'

export interface ConstructorOptions<T = unknown> {
	redis: FastifyInstance['redis']
	data: string
	id: (a: T) => string
	parser: JTDParser<T>
	serializer: (a: T) => string
}

export interface DelOptions {
	lock?: string
	addtional?: (redis: Redis, ...ids: string[]) => Promise<string[]>
}

export class BaseRepository<T = unknown> {
	#redis: ConstructorOptions<T>['redis']
	#data: ConstructorOptions<T>['data']
	#id: ConstructorOptions<T>['id']
	#parser: JTDParser<T>
	#serializer: (a: T) => string

	constructor(opts: ConstructorOptions<T>) {
		this.#redis = opts.redis
		this.#data = opts.data
		this.#id = opts.id
		this.#parser = opts.parser
		this.#serializer = opts.serializer
	}

	get redis() {
		return this.#redis
	}

	get data() {
		return this.#data
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

	async add(mode: 'create' | 'modify' | 'upsert', ...entities: T[]) {
		const redis = await this.#redis.acquire()
		try {
			const keys = []
			for (const entity of entities) {
				keys.push(join(this.data, this.#id(entity)))
			}

			await redis.watch(...keys)
			const pipe = redis.multi()
			for (const [i, u] of entities.entries()) {
				switch (mode) {
				case 'create':
					pipe['json.set'](keys[i], '$', this.serialize(u), 'nx')
					break
				case 'modify':
					pipe['json.set'](keys[i], '$', this.serialize(u), 'xx')
					break
				case 'upsert':
					pipe['json.set'](keys[i], '$', this.serialize(u))
					break
				}
			}
			const res = await pipe.exec()
			for (const [err,] of res) {
				if (err) throw new Error(`can not add entity ${err}`)
			}
		} finally {
			await redis.unwatch()
			await this.#redis.release(redis)
		}
	}

	async getWithPath(...ids: string[]) {
		const res = []
		const redis = await this.#redis.acquire()
		try {
			const pipe = redis.pipeline()
			for (const id of ids) {
				pipe['json.get'](join(this.data, id))
			}
			res.push(...await pipe.exec())
		} finally {
			await this.#redis.release(redis)
		}
		const ret = []
		for (const [err,json] of res) {
			if (err) throw new Error(`can not get entity ${err}`)
			if (!json) continue
			ret.push(this.parse(json))
		}
		return ret
	}

	async delWithOpts(opts: DelOptions, ...ids: string[]) {
		const redis = await this.#redis.acquire()
		try {
			if (opts.lock) {
				await redis.watch(opts.lock)
			} else {
				await redis.watch(...ids)
			}

			const keys = ids.map(id => join(this.data, id))

			if (opts.addtional) {
				keys.push(...await opts.addtional(redis, ...ids))
			}

			let val = false
			if (opts.lock) {
				val = (await redis.get(opts.lock)) === 'true'
			}
			const pipe = redis.multi().del(...keys)
			if (opts.lock) {
				pipe.set(opts.lock, val ? 'false' : 'true')
			}
			const res = await pipe.exec()
			for (const [err,] of res) {
				if (err) throw new Error(`can not delete entity ${err}`)
			}
		} finally {
			await redis.unwatch()
			await this.#redis.release(redis)
		}
	}

	async exists(...ids: string[]) {
		const redis = await this.#redis.acquire()
		try {
			return await redis.exists(...ids.map(e => join(this.data, e)))
		} finally {
			await this.#redis.release(redis)
		}
	}
}
