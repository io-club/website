import type {OAuthUser, OAuthUserRepository} from '@jmondi/oauth2-server'
import type {JTDSchemaType} from '~/alias/jtd'
import type {Config} from '~/api/oauth'
import type {FastifyInstance} from 'fastify'

import {join} from 'pathe'

import {escapeTag} from '~/api/plugins/redis'

import {BaseRepository} from './base'

interface info {
	value: string
	mode: 'public' | 'private'
}

interface mfa_info extends info {
	verified: boolean
}

export interface User {
	id: string
	password: string
	follows: string[]
	nick?: string
	email?: mfa_info
	phone?: mfa_info
}

export const userDefinition: JTDSchemaType<User> = {
	properties: {
		id: { type: 'string', metadata: { format: 'alnun' } },
		password: { type: 'string' },
		follows: {
			elements: {
				type: 'string',
				metadata: { format: 'alnun' },
			},
		},
	},
	optionalProperties: {
		nick: {
			type: 'string',
			metadata: { format: 'alnun' },
		},
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
	#lock: string
	#token_index: string
	#token_data: string
	#code_index: string
	#code_data: string

	constructor(app: FastifyInstance, cfg: Config) {
		super({
			redis: app.redis,
			data: join(cfg.prefix, 'user', 'data'),
			id: (a) => `${a.id}`,
			parser: app.ajv.compileParser(userDefinition),
			serializer: app.ajv.compileSerializer(userDefinition),
		})
		this.#lock = join(cfg.prefix, 'lock')
		this.#token_index = join(cfg.prefix, 'token', 'index')
		this.#token_data = join(cfg.prefix, 'token', 'data')
		this.#code_index = join(cfg.prefix, 'code', 'index')
		this.#code_data = join(cfg.prefix, 'code', 'data')
	}

	async getUserByCredentials(identifier: string) {
		return (await this.getWithPath(identifier))[0]
	}

	async extraAccessTokenFields(user: OAuthUser) {
		return {
			userId: user.id,
			email: user.email,
			phone: user.phone,
		}
	}

	async del(...ids: string[]) {
		await super.delWithOpts({
			lock: this.#lock, 
			addtional: async (redis, ...ids: string[]) => {
				const keys = []

				const re1 = await redis['ft.search'](
					this.#code_index,
					`@user:{${ids.map(id => escapeTag(id)).join(' | ')}}`,
					{
						return: '$.code',
					},
				)
				keys.push(...Object.values(re1).map(([,v]) => join(this.#code_data, v)))

				const re2 = await redis['ft.search'](
					this.#token_index,
					`@user:{${ids.map(id => escapeTag(id)).join(' | ')}}`,
					{
						return: '$.accessToken',
					},
				)
				keys.push(...Object.values(re2).map(([,v]) => join(this.#token_data, v)))

				return keys
			},
		}, ...ids)
	}
}
