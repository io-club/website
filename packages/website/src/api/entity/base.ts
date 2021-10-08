import type {OAuthUserIdentifier} from '@jmondi/oauth2-server'
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

	// WARNING: this api does not prevent you from upserting partial object.
	// You need to follow the contract of API.
	// mode:
	// 1. create: insert full object, only if not exist
	// 2. modify: insert full object, only if exist
	// 3. upsert: insert full object, exist or not
	// 4. patch: partial object with id, only if exist
	async add(mode: 'create' | 'modify' | 'upsert' | 'patch', ...entities: (T | Partial<T>)[]) {
		const redis = await this.#redis.acquire()
		try {
			const keys = []
			for (const entity of entities) {
				const id = this.#id(entity as T)
				if (!id) throw new Error('can not get id from partial entity')
				keys.push(join(this.data, id))
			}

			await redis.watch(...keys)
			const pipe = redis.multi()
			for (const [i, u] of entities.entries()) {
				switch (mode) {
				case 'create':
					pipe['json.set'](keys[i], '$', this.serialize(u as T), 'nx')
					break
				case 'modify':
					pipe['json.set'](keys[i], '$', this.serialize(u as T), 'xx')
					break
				case 'upsert':
					pipe['json.set'](keys[i], '$', this.serialize(u as T))
					break
				case 'patch':
					for (const [k,v] of Object.entries(u as T))
						pipe['json.set'](keys[i], `$.${k}`, this.serialize(v), 'xx')
					break
				}
			}
			const res = await pipe.exec()
			for (const [err,] of res) {
				if (err) throw new Error(`can not execute transaction for entity ${err}`)
			}
		} finally {
			await redis.unwatch()
			await this.#redis.release(redis)
		}
	}

	async getWithPath(...ids: OAuthUserIdentifier[]) {
		const res = []
		const redis = await this.#redis.acquire()
		try {
			const pipe = redis.pipeline()
			for (const id of ids) {
				pipe['json.get'](join(this.data, id.toString()))
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
