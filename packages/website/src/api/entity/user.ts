import type {OAuthCodeRepository} from './oauth_code'
import type {OAuthTokenRepository} from './oauth_token'
import type {GrantIdentifier, OAuthClient, OAuthUser, OAuthUserIdentifier, OAuthUserRepository} from '@jmondi/oauth2-server'
import type {JTDSchemaType} from '~/alias/jtd'
import type {FastifyInstance} from 'fastify'

import {join} from 'pathe'
import RedisErrors from 'redis-errors'

import {escapeTag} from '~/api/plugins/redis'

import {BaseRepository} from './base'

interface info {
	value: string
	mode: 'public' | 'private'
}

interface mfa_info extends info {
	verified: boolean
}

export type verifyFactor = 'password' | 'email' | 'phone'

export interface User {
	id: string
	password: string
	email: mfa_info
	follows: string[]
	nick?: string
	phone?: mfa_info
	login_method: verifyFactor[]
}

export interface SignUpOptions {
	id: string
	password: string
	email: string
}

export interface PatchOptions {
	id: OAuthUserIdentifier
	email?: string
	phone?: string
}

export const userDefinition: JTDSchemaType<User> = {
	properties: {
		id: { type: 'string', metadata: { format: 'alnun' } },
		password: { type: 'string' },
		email: {
			properties: {
				value: {
					type: 'string',
					metadata: { format: 'email' },
				},
				mode: { enum: ['public', 'private'] },
				verified: { type: 'boolean' },
			}
		},
		follows: {
			elements: {
				type: 'string',
				metadata: { format: 'alnun' },
			},
		},
		login_method: {
			elements: {
				enum: [
					'password',
					'email',
					'phone',
				],
			},
		},
	},
	optionalProperties: {
		nick: {
			type: 'string',
			metadata: { format: 'alnun' },
		},
		phone: {
			properties: {
				value: {
					type: 'string',
					metadata: { format: 'phone' },
				},
				mode: { enum: ['public', 'private'] },
				verified: { type: 'boolean' },
			}
		},
	},
}

export class UserRepository extends BaseRepository<User> implements OAuthUserRepository {
	#email_serialize: (a: mfa_info) => string
	#phone_serialize: (a: mfa_info) => string
	#code: OAuthCodeRepository
	#token: OAuthTokenRepository

	constructor(app: FastifyInstance, prefix: string, code: OAuthCodeRepository, token: OAuthTokenRepository) {
		super({
			redis: app.redis,
			prefix: join(prefix, 'user'),
			parser: app.ajv.compileParser(userDefinition),
			serializer: app.ajv.compileSerializer(userDefinition),
		})
		this.#email_serialize = app.ajv.compileSerializer(userDefinition.properties.email)
		this.#phone_serialize = app.ajv.compileSerializer(userDefinition.optionalProperties.phone)
		this.#code = code
		this.#token = token
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
						ident: '$.id',
						as: 'id',
						type: 'tag',
						case_sensitive: true,
					},
					{
						ident: '$.email.value',
						as: 'email',
						type: 'tag',
						case_sensitive: true,
					},
					{
						ident: '$.phone.value',
						as: 'phone',
						type: 'tag',
						case_sensitive: true,
					},
					{
						ident: '$.follows[*]',
						as: 'follow',
						type: 'tag',
						case_sensitive: true,
					},
				)
			},
		})
	}

	async getUserByCredentials(
		identifier: OAuthUserIdentifier,
		_password?: string,
		_grantType?: GrantIdentifier,
		_client?: OAuthClient,
	) {
		return await this.getUserById(identifier)
	}

	async getUserById(identifier: OAuthUserIdentifier) {
		const key = this.data(identifier.toString())
		const res = await this.query(async function (pipe) {
			pipe['json.get'](key)
		})
		if (!res[0]) throw new Error('can not find user')
		return this.parse(res[0])
	}

	async getUserByField(field: 'email' | 'phone', value: string) {
		const res = await this.query(async (pipe) => {
			pipe['ft.search'](
				this.index(),
				`@${field}:{${escapeTag(value)}}`,
			)
		})
		const v: [string, string][] = Object.values(res[0])
		return v.map(([,v]) => this.parse(v))
	}

	async signup(opt: SignUpOptions) {
		await this.transaction({
			query: async (redis) => {
				// check if it is duplicated
				const pipe = redis.pipeline()
				pipe['ft.search'](
					this.index(),
					`@email:{${escapeTag(opt.email)}}`,
				)
				pipe['ft.search'](
					this.index(),
					`@id:{${escapeTag(opt.id)}}`,
				)
				const res = await pipe.exec()
				for (const [err,v] of res) {
					if (err) throw new Error(`can not complete transaction ${err}`)
					if (Object.keys(v).length !== 0)
						throw new Error('duplicated user')
				}
			},
			handler: async (pipe) => {
				const key = this.data(opt.id)

				const user: User = {
					id: opt.id,
					password: opt.password,
					email: {
						value: opt.email,
						mode: 'public',
						verified: false,
					},
					follows: [],
					login_method: ['password'],
				}

				pipe['json.set'](key, '$', this.serialize(user))
			},
		})
	}

	async patch(opt: PatchOptions) {
		const key = this.data(opt.id.toString())
		await this.transaction({
			watch: [key],
			handler: async (pipe) => {
				if (opt.email) {
					pipe['json.set'](key, '$.email', this.#email_serialize({
						value: opt.email,
						mode: 'public',
						verified: false,
					}), 'xx')
				}

				if (opt.phone) {
					pipe['json.set'](key, '$.phone', this.#phone_serialize({
						value: opt.phone,
						mode: 'public',
						verified: false,
					}), 'xx')
				}
			},
		})
	}

	async add(mode: 'create' | 'modify' | 'upsert', user: User) {
		const res = await this.transaction<string[]>({
			handler: async (pipe) => {
				const key = this.data(user.id)
				switch (mode) {
				case 'create':
					pipe['json.set'](key, '$', this.serialize(user), 'nx')
					break
				case 'modify':
					pipe['json.set'](key, '$', this.serialize(user), 'xx')
					break
				case 'upsert':
					pipe['json.set'](key, '$', this.serialize(user))
					break
				}
			},
		})
		return res[0] as string
	}

	async del(id: OAuthUserIdentifier) {
		await this.transaction<string[]>({
			watch: [this.txn(), this.#code.txn(), this.#token.txn()],
			query: async (redis) => {
				const key = this.data(id.toString())
				const re0 = await redis['exists'](key)
				if (re0 === 0)
					throw new Error('user not exist')

				const re1 = await redis['ft.search'](
					this.#code.index(),
					`@user:{${escapeTag(id.toString())}}`,
				)
				const re2 = await redis['ft.search'](
					this.#token.index(),
					`@user:{${escapeTag(id.toString())}}`,
				)
				return [key, ...Object.keys(re1), ...Object.keys(re2)]
			},
			handler: async (pipe, values) => {
				if (values) pipe['del'](...values)
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

	async extraAccessTokenFields(user: OAuthUser) {
		return {
			userId: user.id,
			email: user.email,
			phone: user.phone,
		}
	}
}
