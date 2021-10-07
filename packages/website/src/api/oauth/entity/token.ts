import type {OAuthClient, OAuthScope, OAuthToken, OAuthTokenRepository, OAuthUser} from '@jmondi/oauth2-server'
import type {JTDDataType} from '~/alias/jtd'
import type {Config} from '~/api/oauth'
import type {FastifyInstance} from 'fastify'

import dayjs from 'dayjs'
import {customAlphabet} from 'nanoid'
import {join} from 'pathe'

import {BaseRepository} from '~/api/entity/base'

import {clientDefinition} from './client'
import {scopeDefinition} from './scope'
import {userDefinition} from './user'

export const tokenDefinition = {
	properties: {
		accessToken: { type: 'string', metadata: { format: 'alnun' } },
		accessTokenExpiresAt: { type: 'timestamp' },
		clientId: clientDefinition.properties.id,
		scopeNames: { elements: scopeDefinition.properties.name },
	},
	optionalProperties: {
		refreshToken: { type: 'string', metadata: { format: 'alnun' } },
		refreshTokenExpiresAt: { type: 'timestamp' },
		userId: userDefinition.properties.id,
	},
} as const

type T = JTDDataType<typeof tokenDefinition>
export class TokenRepository extends BaseRepository<T> implements OAuthTokenRepository {
	#idgen: () => string
	#index: string

	constructor(app: FastifyInstance, cfg: Config) {
		super({
			redis: app.redis,
			data: join(cfg.prefix, 'token', 'data'),
			id: (a) => `${a.accessToken}`,
			parser: app.ajv.compileParser(tokenDefinition),
			serializer: app.ajv.compileSerializer(tokenDefinition),
		})
		this.#idgen = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz', 21)
		this.#index = join(cfg.prefix, 'token', 'index')
	}

	async del(...ids: string[]) {
		await super.delWithOpts({}, ...ids)
	}

	async issueToken(client: OAuthClient, _scopes: OAuthScope[], user?: OAuthUser) {
		return <OAuthToken>{
			accessToken: this.#idgen(),
			accessTokenExpiresAt: null as unknown as Date,
			clientId: client.id,
			userId: user?.id,
			scopeNames: _scopes.map(e => e.name),
		}
	}

	async persist(accessToken: OAuthToken) {
		// TODO: fix type cast
		await this.add('upsert', accessToken as unknown as T)
	}

	async revoke(accessToken: OAuthToken) {
		await this.del(accessToken.accessToken)
	}

	async isRevoked(accessToken: string) {
		return await this.exists(accessToken) == 0
	}

	async getByRefreshToken(refreshToken: string) {
		const redis = await super.redis.acquire()
		try {
			const res = (await redis['ft.search'](this.#index, `@refresh:{${refreshToken}}`))

			const tokens = Object.values(res)
			if (tokens.length !== 1)
				throw new Error('can not find the token')
			if (tokens[0][0])
				throw new Error(`can not find the token ${tokens[0][0]}`)

			// TODO: refer https://github.com/ajv-validator/ajv/issues/1780
			return super.parse(tokens[0][1]) as OAuthToken
		} finally {
			await super.redis.release(redis)
		}
	}

	async isRefreshTokenRevoked(token: OAuthToken) {
		if (!token.refreshTokenExpiresAt) return true
		return dayjs().valueOf() > dayjs(token.refreshTokenExpiresAt).valueOf()
	}

	async issueRefreshToken(token: OAuthToken) {
		token.refreshToken = this.#idgen()
		token.refreshTokenExpiresAt = dayjs().add(1, 'day').toDate()
		const redis = await super.redis.acquire()
		try {
			const key = join(this.data, token.accessToken)
			let pipe = redis.multi()
			pipe = pipe['json.set'](key, '$.refreshToken', token.refreshToken, 'xx')
			pipe = pipe['json.set'](key, '$.refreshTokenExpiresAt', token.refreshTokenExpiresAt, 'xx')
			const res = await pipe.exec()
			for (const [err,] of res) {
				if (err) throw new Error(`fails to set ${err}`)
			}
			return token
		} finally {
			await super.redis.release(redis)
		}
	}
}
