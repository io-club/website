import type {OAuthClient, OAuthScope, OAuthToken, OAuthTokenRepository as tokenRepository, OAuthUser} from '@jmondi/oauth2-server'
import type {JTDSchemaType} from '~/alias/jtd'
import type {FastifyInstance} from 'fastify'

import dayjs from 'dayjs'
import {customAlphabet} from 'nanoid'
import {join} from 'pathe'
import RedisErrors from 'redis-errors'

import {BaseRepository} from './base'
import {OAuthClientDefinition} from './oauth_client'
import {OAuthScopeDefinition} from './oauth_scope'
import {userDefinition} from './user'
import { escapeTag } from '~/api/plugins/redis'

export interface Token {
	accessToken: string;
	accessTokenExpiresAt: Date;
	refreshToken?: string;
	refreshTokenExpiresAt?: Date;
	clientId: string;
	userId?: string;
	scopeNames: string[];
}

export const tokenDefinition: JTDSchemaType<Token> = {
	properties: {
		accessToken: { type: 'string', metadata: { format: 'alnun' } },
		accessTokenExpiresAt: { type: 'timestamp' },
		clientId: OAuthClientDefinition.properties.id,
		scopeNames: { elements: OAuthScopeDefinition.properties.name },
	},
	optionalProperties: {
		refreshToken: { type: 'string', metadata: { format: 'alnun' } },
		refreshTokenExpiresAt: { type: 'timestamp' },
		userId: userDefinition.properties.id,
	},
}

export class OAuthTokenRepository extends BaseRepository<Token> implements tokenRepository {
	#idgen: () => string
	#refreshToken_serialize: (a: string) => string
	#refreshTokenExpireAt_serialize: (a: Date) => string

	constructor(app: FastifyInstance, prefix: string) {
		super({
			redis: app.redis,
			prefix: join(prefix, 'oauth_token'),
			parser: app.ajv.compileParser(tokenDefinition),
			serializer: app.ajv.compileSerializer(tokenDefinition),
		})
		this.#idgen = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz', 21)
		this.#refreshToken_serialize = app.ajv.compileSerializer(tokenDefinition.optionalProperties.refreshToken)
		this.#refreshTokenExpireAt_serialize = app.ajv.compileSerializer(tokenDefinition.optionalProperties.refreshTokenExpiresAt)
	}

	async create_index() {
		await this.transaction({
			precheck: async (redis) => {
				try {
					await redis['ft.info'](this.index())
				} catch (err) {
					if (err instanceof RedisErrors.ReplyError) {
						if (err.message === 'Unknown Index name') return true
					}
				}
				return false
			},
			handler: async (pipe) => {
				pipe['ft.create']('json',
					{
						name: this.index(),
						prefix: [this.data()],
					},
					{
						ident: '$.accessToken',
						as: 'id',
						type: 'tag',
						case_sensitive: true,
					},
					{
						ident: '$.refreshToken',
						as: 'refresh',
						type: 'tag',
						case_sensitive: true,
					},
					{
						ident: '$.client.id',
						as: 'client',
						type: 'tag',
						case_sensitive: true,
					},
					{
						ident: '$.user.id',
						as: 'user',
						type: 'tag',
						case_sensitive: true,
					},
					{
						ident: '$.scopes[*].name',
						as: 'scope',
						type: 'tag',
						case_sensitive: true,
					},
				)
			},
		})
	}

	async issueToken(client: OAuthClient, scopes: OAuthScope[], user?: OAuthUser) {
		return {
			accessToken: this.#idgen(),
			clientId: client.id,
			userId: user?.id,
			scopeNames: scopes.map(e => e.name),
		}
	}

	async persist(accessToken: OAuthToken) {
		const key = this.data(accessToken.accessToken)
		await this.transaction({
			watch: [key],
			handler: async (pipe) => {
				// TODO: fix type cast
				pipe['json.set'](key, '$', this.serialize(accessToken as unknown as Token), 'nx')
				if (accessToken.refreshTokenExpiresAt)
					pipe['expireat'](key, dayjs(accessToken.refreshTokenExpiresAt).unix())
				else
					pipe['expireat'](key, dayjs(accessToken.accessTokenExpiresAt).unix())
			},
		})
	}

	async revoke(accessToken: OAuthToken) {
		const key = this.data(accessToken.accessToken)
		await this.transaction({
			watch: [key],
			handler: async (pipe) => {
				pipe['del'](key)
			},
		})
	}

	async isRevoked(accessToken: string) {
		const key = this.data(accessToken)
		const res = await this.query(async function (pipe) {
			pipe['exists'](key)
		})
		return res[0] === 0
	}

	async getByRefreshToken(refreshToken: string) {
		const key = this.index()
		const res = await this.query(async (pipe) => {
			pipe['ft.search'](key, `@refresh:{${escapeTag(refreshToken)}}`)
		})
		if (res.length !== 1 || !res[0]) return null
		return this.parse(res[0])
	}

	async isRefreshTokenRevoked() {
		// this is a stub function
		return true
	}

	async issueRefreshToken(token: OAuthToken) {
		token.refreshToken = this.#idgen()
		token.refreshTokenExpiresAt = dayjs().add(1, 'day').toDate()
		const key = this.data(token.accessToken)
		await this.transaction({
			watch: [key],
			handler: async (pipe) => {
				pipe['json.set'](key, '$.refreshToken', this.#refreshToken_serialize(token.refreshToken), 'xx')
				pipe['json.set'](key, '$.refreshTokenExpiresAt', this.#refreshTokenExpireAt_serialize(token.refreshTokenExpiresAt), 'xx')
			},
		})
		return token
	}
}
