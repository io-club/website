import type {GrantIdentifier, OAuthClient, OAuthClientRepository} from '@jmondi/oauth2-server'
import type {JTDDataType} from '~/alias/jtd'
import type {Config} from '~/api/oauth'
import type {FastifyInstance} from 'fastify'

import {join} from 'pathe'

import {BaseRepository} from '~/api/entity/base'
import {escapeTag} from '~/api/plugins/redis'

import {grantIdentDefinition} from './grantIdent'
import {scopeDefinition} from './scope'

export const clientDefinition = {
	properties: {
		id: { type: 'string', metadata: { format: 'alnun' } },
		name: { type: 'string' },
		redirectUris: { elements: { type: 'string' } },
		allowedGrants: { elements: grantIdentDefinition },
		scopeNames: { elements: scopeDefinition.properties.name },
	},
	optionalProperties: {
		secret: { type: 'string' },
	},
} as const

export class ClientRepository extends BaseRepository<JTDDataType<typeof clientDefinition>> implements OAuthClientRepository {
	#lock: string
	#token_index: string
	#token_data: string
	#code_index: string
	#code_data: string

	constructor(app: FastifyInstance, cfg: Config) {
		super({
			redis: app.redis,
			data: join(cfg.prefix, 'client', 'data'),
			id: (a: OAuthClient) => `${a.id}`,
			parser: app.ajv.compileParser(clientDefinition),
			serializer: app.ajv.compileSerializer(clientDefinition),
		})
		this.#lock = join(cfg.prefix, 'lock')
		this.#token_index = join(cfg.prefix, 'token', 'index')
		this.#token_data = join(cfg.prefix, 'token', 'data')
		this.#code_index = join(cfg.prefix, 'code', 'index')
		this.#code_data = join(cfg.prefix, 'code', 'data')
	}

	async del(...ids: string[]) {
		await super.delWithOpts({
			lock: this.#lock, 
			addtional: async (redis, ...ids: string[]) => {
				const keys = []

				const re1 = await redis['ft.search'](
					this.#code_index,
					`@client:{${ids.map(id => escapeTag(id)).join(' | ')}}`,
					{
						return: '$.code',
					},
				)
				keys.push(...Object.values(re1).map(([,v]) => join(this.#code_data, v)))

				const re2 = await redis['ft.search'](
					this.#token_index,
					`@client:{${ids.map(id => escapeTag(id)).join(' | ')}}`,
					{
						return: '$.accessToken',
					},
				)
				keys.push(...Object.values(re2).map(([,v]) => join(this.#token_data, v)))

				return keys
			},
		}, ...ids)
	}

	async getByIdentifier(clientId: string) {
		return (await this.getWithPath(clientId))[0]
	}

	async isClientValid(grantType: GrantIdentifier, client: OAuthClient, clientSecret?: string) {
		return client.secret === clientSecret && client.allowedGrants.includes(grantType)
	}
}
