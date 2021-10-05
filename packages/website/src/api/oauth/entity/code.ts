import type {OAuthAuthCode, OAuthAuthCodeRepository, OAuthClient, OAuthScope, OAuthUser} from '@jmondi/oauth2-server'
import type {Context} from '~/api/oauth'
import type {ValidateFunction} from 'ajv'

import dayjs from 'dayjs'
import {nanoid} from 'nanoid'
import {join} from 'pathe'

import {clientDefinition} from './client'
import {scopeDefinition} from './scope'
import {userDefinition} from './user'

export const codeDefinition = {
	properties: {
		code: { type: 'string' },
		expiresAt: { type: 'timestamp' },
		client: clientDefinition,
		scopes: { elements: scopeDefinition },
	},
	optionalProperties: {
		redirectUri: { type: 'string' },
		codeChallenge: { type: 'string' },
		codeChallengeMethod: { enum: ['S256', 'plain'] },
		user: userDefinition,
	},
} as const

export class CodeRepository implements OAuthAuthCodeRepository {
	#ctx: Context
	#index: string
	#data: string
	#validate: ValidateFunction<OAuthAuthCode>

	constructor(ctx: Context) {
		this.#ctx = ctx
		this.#index = join(ctx.cfg.prefix, 'code', 'index')
		this.#data = join(ctx.cfg.prefix, 'code', 'data')
		this.#validate = ctx.app.ajv.compile(codeDefinition)
	}

	get index() {
		return this.#index
	}

	get data() {
		return this.#data
	}

	issueAuthCode(client: OAuthClient, user: OAuthUser | undefined, _scopes: OAuthScope[]) {
		// TODO: we only need to init
		// code/client/user according to the source code
		// https://github.com/jasonraimondi/ts-oauth2-server/blob/0bc94c57ece8ec8bc07057273b12ea555b9b5f00/src/grants/auth_code.grant.ts#L253-L272
		return {
			code: nanoid(),
			client,
			user,
		} as any
	}

	async persist(authCode: OAuthAuthCode) {
		const redis = await this.#ctx.app.redis.acquire()
		try {
			const res = await redis['json.set'](join(this.data, authCode.code), authCode)
			if (!res) throw new Error('fails to set')
		} finally {
			await this.#ctx.app.redis.release(redis)
		}
	}

	async isRevoked(authCode: string) {
		const redis = await this.#ctx.app.redis.acquire()
		try {
			const res = await redis.exists(join(this.data, authCode))
			return res === 0
		} finally {
			await this.#ctx.app.redis.release(redis)
		}
	}

	async getByIdentifier(authCode: string) {
		const redis = await this.#ctx.app.redis.acquire()
		try {
			const res = (await redis['ft.search'](this.index, `@code:{${authCode}}`))

			const codes = Object.values(res)
			if (codes.length !== 1) throw new Error('can not find code')

			const r = codes[0][1] as Record<string, unknown>

			if (typeof r.expiresAt === 'string')
				r.expiresAt = dayjs(r.expiresAt).toDate()

			if (!this.#validate(r)) throw new Error(`invalid code\n${r}`)

			return r
		} finally {
			await this.#ctx.app.redis.release(redis)
		}
	}

	async revoke(authCode: string) {
		const redis = await this.#ctx.app.redis.acquire()
		try {
			await redis.del(join(this.data, authCode))
		} finally {
			await this.#ctx.app.redis.release(redis)
		}
	}
}
