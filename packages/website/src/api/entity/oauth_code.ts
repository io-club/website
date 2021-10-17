import type {CodeChallengeMethod, OAuthAuthCode, OAuthAuthCodeRepository, OAuthClient, OAuthScope, OAuthUser} from '@jmondi/oauth2-server'
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

export interface OAuthCode {
	code: string;
	redirectUri?: string;
	codeChallenge?: string;
	codeChallengeMethod?: CodeChallengeMethod;
	expiresAt: Date;
	userId?: string;
	clientId: string;
	scopeNames: string[];
}

export const OAuthCodeDefinition: JTDSchemaType<OAuthCode> = {
	properties: {
		code: { type: 'string', metadata: { format: 'alnun' } },
		expiresAt: { type: 'timestamp' },
		clientId: OAuthClientDefinition.properties.id,
		scopeNames: { elements: OAuthScopeDefinition.properties.name },
	},
	optionalProperties: {
		redirectUri: { type: 'string' },
		codeChallenge: { type: 'string' },
		codeChallengeMethod: { enum: ['S256', 'plain'] },
		userId: userDefinition.properties.id,
	},
}

export class OAuthCodeRepository extends BaseRepository<OAuthCode> implements OAuthAuthCodeRepository {
	#idgen: () => string

	constructor(app: FastifyInstance, prefix: string) {
		super({
			redis: app.redis,
			prefix: join(prefix, 'oauth_code'),
			parser: app.ajv.compileParser(OAuthCodeDefinition),
			serializer: app.ajv.compileSerializer(OAuthCodeDefinition),
		})
		this.#idgen = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz', 21)
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
						ident: '$.code',
						as: 'id',
						type: 'tag',
						case_sensitive: true,
					},
					{
						ident: '$.clientId',
						as: 'client',
						type: 'tag',
						case_sensitive: true,
					},
					{
						ident: '$.userId',
						as: 'user',
						type: 'tag',
						case_sensitive: true,
					},
					{
						ident: '$.scopeNames[*]',
						as: 'scope',
						type: 'tag',
						case_sensitive: true,
					},
				)
			},
		})
	}

	async issueAuthCode(client: OAuthClient, user: OAuthUser | undefined, scopes: OAuthScope[]) {
		return {
			code: this.#idgen(),
			clientId: client.id,
			userId: user?.id,
			scopeNames: scopes.map(e => e.name),
		}
	}

	async persist(authCode: OAuthAuthCode) {
		const key = this.data(authCode.code)
		await this.transaction({
			watch: [key],
			handler: async (pipe) => {
				// TODO: fix type cast
				pipe['json.set'](key, '$', this.serialize(authCode as unknown as OAuthCode), 'nx')
				pipe['expireat'](key, dayjs(authCode.expiresAt).unix())
			},
		})
	}

	async isRevoked(authCode: string) {
		const key = this.data(authCode)
		const res = await this.query(async function (pipe) {
			pipe['exists'](key)
		})
		return res[0] === 0
	}

	async getByIdentifier(authCode: string) {
		const key = this.data(authCode)
		const res = await this.query(async function (pipe) {
			pipe['json.get'](key)
		})
		if (!res[0]) throw new Error('can not find code')
		return this.parse(res[0])
	}

	async revoke(authCode: string) {
		const key = this.data(authCode)
		await this.transaction({
			watch: [key],
			handler: async (pipe) => {
				pipe['del'](key)
			},
		})
	}
}
