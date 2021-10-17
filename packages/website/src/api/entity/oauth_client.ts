import type {GrantIdentifier, OAuthClient, OAuthClientRepository as clientRepository} from '@jmondi/oauth2-server'
import type {JTDSchemaType} from '~/alias/jtd'
import type {FastifyInstance} from 'fastify'

import {join} from 'pathe'
import RedisErrors from 'redis-errors'

import {BaseRepository} from './base'
import {OAuthScopeDefinition} from './oauth_scope'

export interface Client extends OAuthClient {
	description?: string
}

export const OAuthClientDefinition: JTDSchemaType<Client> = {
	properties: {
		id: { type: 'string', metadata: { format: 'alnun' } },
		name: { type: 'string' },
		redirectUris: { elements: { type: 'string' } },
		allowedGrants: {
			elements:  {
				enum: ['authorization_code', 'client_credentials', 'refresh_token', 'password', 'implicit'],
			},
		},
		scopeNames: { elements: OAuthScopeDefinition.properties.name },
	},
	optionalProperties: {
		secret: { type: 'string' },
		description: { type: 'string' },
	},
}

export class OAuthClientRepository extends BaseRepository<Client> implements clientRepository {
	constructor(app: FastifyInstance, prefix: string) {
		super({
			redis: app.redis,
			prefix: join(prefix, 'oauth_client'),
			parser: app.ajv.compileParser(OAuthClientDefinition),
			serializer: app.ajv.compileSerializer(OAuthClientDefinition),
		})
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
						ident: '$.allowedGrants[*]',
						as: 'grant',
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

	async add(...clients: Client[]) {
		const keys = clients.map(e => this.data(e.id))
		await this.transaction({
			watch: keys,
			handler: async (pipe) => {
				for (const [i,v] of clients.entries()) {
					pipe['json.set'](keys[i], '$', this.serialize(v), 'nx')
				}
			},
		})
	}

	async getByIdentifier(clientId: string) {
		const key = this.data(clientId)
		const res = await this.query(async function (pipe) {
			pipe['json.get'](key)
		})
		if (!res[0]) throw new Error('can not find client')
		return this.parse(res[0])
	}

	async isClientValid(grantType: GrantIdentifier, client: OAuthClient, clientSecret?: string) {
		return client.secret === clientSecret && client.allowedGrants.includes(grantType)
	}
}
