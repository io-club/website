import type {OAuthUser, OAuthUserRepository} from '@jmondi/oauth2-server'
import type {ValidateFunction} from '~/alias/jtd'
import type {Context} from '~/api/oauth'

import {join} from 'pathe'

export const userDefinition = {
	properties: {
		id: { type: 'string' },
	},
	additionalProperties: true,
} as const

export class UserRepository implements OAuthUserRepository {
	#ctx: Context
	#index: string
	#data: string
	#validate: ValidateFunction<OAuthUser>

	constructor(ctx: Context) {
		this.#ctx = ctx
		this.#index = join(ctx.cfg.prefix, 'user', 'index')
		this.#data = join(ctx.cfg.prefix, 'user', 'data')
		this.#validate = ctx.app.ajv.compile(userDefinition)
	}

	get index() {
		return this.#index
	}

	get data() {
		return this.#data
	}

	async getUserByCredentials(identifier: string) {
		const redis = await this.#ctx.app.redis.acquire()
		try {
			const res = (await redis['ft.search'](this.index, `@id:{${identifier}}`))

			const users = Object.values(res)
			if (users.length !== 1) throw new Error('get more than one user')

			const user = users[0][1]
			if (!this.#validate(user)) throw new Error('invalid user')
			return user
		} finally {
			await this.#ctx.app.redis.release(redis)
		}
	}

	async extraAccessTokenFields(user: OAuthUser) {
		return {
			email: user.email,
		}
	}
}
