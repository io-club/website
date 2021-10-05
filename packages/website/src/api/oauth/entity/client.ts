import type {GrantIdentifier, OAuthClient, OAuthClientRepository} from '@jmondi/oauth2-server'
import type {ValidateFunction} from '~/alias/jtd'
import type {Context} from '~/api/oauth'

import {join} from 'pathe'

import {grantIdentDefinition} from './grantIdent'
import {scopeDefinition} from './scope'

export const clientDefinition = {
	properties: {
		id: { type: 'string' },
		name: { type: 'string' },
		redirectUris: { elements: { type: 'string' } },
		allowedGrants: { elements: grantIdentDefinition },
		scopes: { elements: scopeDefinition },
	},
	optionalProperties: {
		secret: { type: 'string' },
	},
} as const

export class ClientRepository implements OAuthClientRepository {
	#index: string
	#data: string
	#ctx: Context
	#validate: ValidateFunction<OAuthClient>

	constructor(ctx: Context) {
		this.#ctx = ctx
		this.#validate = ctx.app.ajv.compile(clientDefinition)
		this.#index = join(ctx.cfg.prefix, 'client', 'index')
		this.#data = join(ctx.cfg.prefix, 'client', 'data')
	}

	get index() {
		return this.#index
	}

	get data() {
		return this.#data
	}

	async add(...clients: unknown[]) {
		const redis = await this.#ctx.app.redis.acquire()
		try {
			let pipe = redis.pipeline()
			for (const client of clients) {
				if (!this.#validate(client)) throw new Error('invalid client')
				pipe = pipe['json.set'](join(this.data, client.id), client)
			}
			const res = await pipe.exec()
			for (const [err,] of res) {
				if (err) throw new Error(`fails to set ${err}`)
			}
		} finally {
			await this.#ctx.app.redis.release(redis)
		}
	}

	/*
	async del(...clients: string[]) {
		const redis = await this.#ctx.app.redis.acquire()
		try {
			await redis.watch()
			let pipe = redis.pipeline()
			for (const client of clients) {
				pipe = pipe['json.del'](join(this.data, client.id), client)
			}
			const res = await pipe.exec()
			for (const [err,] of res) {
				if (err) throw new Error(`fails to set ${err}`)
			}
		} finally {
			await redis.unwatch()
			await this.#ctx.app.redis.release(redis)
		}
	}
	*/

	async getByIdentifier(clientId: string) {
		const redis = await this.#ctx.app.redis.acquire()
		try {
			const res = (await redis['ft.search'](this.index, `@id:{${clientId}}`))

			const clients = Object.values(res)
			if (clients.length !== 1) {
				// TODO: trick to bypass the type check
				// this API can return null
				// https://github.com/jasonraimondi/ts-oauth2-server/blob/0bc94c57ece8ec8bc07057273b12ea555b9b5f00/src/grants/auth_code.grant.ts#L138-L140
				return undefined as unknown as OAuthClient
			}
			if (!this.#validate(clients[0][1])) {
				// TODO: same as the previous check
				return undefined as unknown as OAuthClient
			}

			return clients[0][1]
		} finally {
			await this.#ctx.app.redis.release(redis)
		}
	}

	async isClientValid(grantType: GrantIdentifier, client: OAuthClient, clientSecret?: string) {
		return client.secret === clientSecret && client.allowedGrants.includes(grantType)
	}
}
