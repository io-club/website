import type {OAuthUser, OAuthUserRepository} from '@jmondi/oauth2-server'
import type {JTDDataType} from '~/alias/jtd'
import type {Config} from '~/api/oauth'
import type {FastifyInstance} from 'fastify'

import {join} from 'pathe'

import {BaseRepository} from '~/api/entity/base'
import {escapeTag} from '~/api/plugins/redis'

export const userDefinition = {
	properties: {
		id: { type: 'string', metadata: { format: 'alnun' } },
		access: { 
			elements: {
				properties: {
					prop: { type: 'string' },
					mode: { enum: ['public', 'private'] },
				},
			},
		},
	},
	optionalProperties: {
		email: {
			type: 'string',
			metadata: { format: 'email' },
		},
		phone: {
			type: 'string',
			metadata: { format: 'phone' },
		},
	},
} as const

export class UserRepository extends BaseRepository<JTDDataType<typeof userDefinition>> implements OAuthUserRepository {
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
