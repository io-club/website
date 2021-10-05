import type {OAuthClient, OAuthScope, OAuthToken, OAuthTokenRepository, OAuthUser} from '@jmondi/oauth2-server'
import type {ValidateFunction} from '~/alias/jtd'
import type {Context} from '~/api/oauth'

import dayjs from 'dayjs'
import {nanoid} from 'nanoid'
import {join} from 'pathe'

import {clientDefinition} from './client'
import {scopeDefinition} from './scope'
import {userDefinition} from './user'

export const tokenDefinition = {
	properties: {
		accessToken: { type: 'string' },
		accessTokenExpiresAt: { type: 'timestamp' },
		client: clientDefinition,
		scopes: { elements: scopeDefinition },
	},
	optionalProperties: {
		refreshToken: { type: 'string' },
		refreshTokenExpiresAt: { type: 'timestamp' },
		user: userDefinition,
	},
} as const

export class TokenRepository implements OAuthTokenRepository {
	#ctx: Context
	#index: string
	#data: string
	#validate: ValidateFunction<OAuthToken>

	constructor(ctx: Context) {
		this.#ctx = ctx
		this.#index = join(ctx.cfg.prefix, 'token', 'index')
		this.#data = join(ctx.cfg.prefix, 'token', 'data')
		this.#validate = ctx.app.ajv.compile(tokenDefinition)
	}

	get index() {
		return this.#index
	}

	get data() {
		return this.#data
	}

	async issueToken(client: OAuthClient, _scopes: OAuthScope[], user: OAuthUser) {
		// TODO: we dont need to init
		// accessTokenExpiresAt/refresh... according to the source code
		// fix the type cast warning
		return {
			accessToken: nanoid(),
			client,
			user,
			scopes: _scopes.filter(e => client.scopes.includes(e)),
		} as any
	}

	async persist(accessToken: OAuthToken) {
		const redis = await this.#ctx.app.redis.acquire()
		try {
			const res = await redis['json.set'](join(this.data, accessToken.accessToken), accessToken)
			if (!res) throw new Error('fails to set')
		} finally {
			await this.#ctx.app.redis.release(redis)
		}
	}

	async revoke(accessToken: OAuthToken) {
		const redis = await this.#ctx.app.redis.acquire()
		try {
			const key = join(this.data, accessToken.accessToken)
			await redis.watch(key)
			const exists = await redis.exists(key)
			if (exists) {
				let pipe = redis.multi()
				pipe = pipe['json.set'](key, '$.accessTokenExpiresAt', 0)
				pipe = pipe['json.set'](key, '$.refreshTokenExpiresAt', 0)
				const res = await pipe.exec()
				for (const [err,] of res) {
					if (err) throw new Error(`fails to set ${err}`)
				}
			}
		} finally {
			await redis.unwatch()
			await this.#ctx.app.redis.release(redis)
		}
	}

	async isRevoked(accessToken: string) {
		const redis = await this.#ctx.app.redis.acquire()
		try {
			const res = await redis.exists(join(this.data, accessToken))
			return res === 0
		} finally {
			await this.#ctx.app.redis.release(redis)
		}
	}

	async getByRefreshToken(refreshToken: string) {
		const redis = await this.#ctx.app.redis.acquire()
		try {
			const res = (await redis['ft.search'](this.index, `@refreshToken:{${refreshToken}}`))

			const tokens = Object.values(res)
			if (tokens.length !== 1) throw new Error('can not find the token')

			const r = tokens[0][1] as Record<string, unknown>

			if (typeof r.accessTokenExpiresAt === 'string')
				r.accessTokenExpiresAt = dayjs(r.accessTokenExpiresAt).toDate()
			if (typeof r.refreshTokenExpiresAt === 'string')
				r.refreshTokenExpiresAt = dayjs(r.refreshTokenExpiresAt).toDate()

			if (!this.#validate(r)) throw new Error('invalid token')

			return r
		} finally {
			await this.#ctx.app.redis.release(redis)
		}
	}

	async isRefreshTokenRevoked(token: OAuthToken) {
		if (!token.refreshTokenExpiresAt) return true
		return dayjs().valueOf() > dayjs(token.refreshTokenExpiresAt).valueOf()
	}

	async issueRefreshToken(token: OAuthToken) {
		token.refreshToken = nanoid()
		token.refreshTokenExpiresAt = dayjs().add(1, 'day').toDate()
		const redis = await this.#ctx.app.redis.acquire()
		try {
			const key = join(this.data, token.accessToken)
			let pipe = redis.pipeline()
			pipe = pipe['json.set'](key, '$.refreshToken', token.refreshToken)
			pipe = pipe['json.set'](key, '$.refreshTokenExpiresAt', token.refreshTokenExpiresAt)
			const res = await pipe.exec()
			for (const [err,] of res) {
				if (err) throw new Error(`fails to set ${err}`)
			}
			return token
		} finally {
			await this.#ctx.app.redis.release(redis)
		}
	}
}
