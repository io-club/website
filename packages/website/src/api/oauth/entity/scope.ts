import type {GrantIdentifier, OAuthClient, OAuthScope, OAuthScopeRepository} from '@jmondi/oauth2-server'
import type {ValidateFunction} from '~/alias/jtd'
import type {Context} from '~/api/oauth'

import {join} from 'pathe'

export const scopeDefinition = {
	properties: {
		name: { type: 'string' }
	},
	additionalProperties: true
} as const

export class ScopeRepository implements OAuthScopeRepository {
	#ctx: Context
	#index: string
	#data: string
	#validate: ValidateFunction<OAuthScope>

	constructor(ctx: Context) {
		this.#ctx = ctx
		this.#index = join(ctx.cfg.prefix, 'scope', 'index')
		this.#data = join(ctx.cfg.prefix, 'scope', 'data')
		this.#validate = ctx.app.ajv.compile(scopeDefinition)
	}

	get index() {
		return this.#index
	}

	get data() {
		return this.#data
	}

	async getAllByIdentifiers(scopeNames: string[]) {
		const redis = await this.#ctx.app.redis.acquire()
		try {
			const res = (await redis['ft.search'](this.index, `@name:{${scopeNames.join(' | ')}}`))
			const ret = []
			for (const [,v] of Object.values(res)) {
				if (!this.#validate(v)) throw new Error('invalid oauth scope')
				// this API only requires valid scopes
				if (v) ret.push(v)
			}
			return ret
		} finally {
			await this.#ctx.app.redis.release(redis)
		}
	}

	async finalize(
		scopes: OAuthScope[],
		_identifier: GrantIdentifier,
		_client: OAuthClient,
		_user_id?: string,
	) {
		if (!_client.allowedGrants.includes(_identifier))
			throw new Error('client request forbidden grant_type')
		if (scopes.some(e => !_client.scopes.includes(e)))
			throw new Error('client request forbidden scope')
		return scopes
	}

	async add(...scopes: unknown[]) {
		const redis = await this.#ctx.app.redis.acquire()
		try {
			let pipe = redis.pipeline()
			for (const scope of scopes) {
				if (!this.#validate(scope)) throw new Error('invalid scope')
				pipe = pipe['json.set'](join(this.data, scope.id), scope)
			}
			const res = await pipe.exec()
			for (const [err,] of res) {
				if (err) throw new Error(`fails to set ${err}`)
			}
		} finally {
			await this.#ctx.app.redis.release(redis)
		}
	}
}
