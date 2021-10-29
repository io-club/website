import type {GrantIdentifier, OAuthClient, OAuthScope, OAuthScopeRepository as scopeRepository} from '@jmondi/oauth2-server'
import type {JTDSchemaType} from '~/alias/jtd'
import type {FastifyInstance} from 'fastify'

import {join} from 'pathe'
import RedisErrors from 'redis-errors'

import {escapeTag} from '../plugins/redis'
import {BaseRepository} from './base'

export interface Scope {
	name: string;
	description?: string;
}

export const OAuthScopeDefinition: JTDSchemaType<Scope> = {
	properties: {
		name: { type: 'string', metadata: { format: 'alnun' } }
	},
	optionalProperties: {
		description: { type: 'string' },
	},
}

export class OAuthScopeRepository extends BaseRepository<Scope> implements scopeRepository {
	constructor(app: FastifyInstance, prefix: string) {
		super({
			redis: app.redis,
			prefix: join(prefix, 'oauth_scope'),
			parser: app.ajv.compileParser(OAuthScopeDefinition),
			serializer: app.ajv.compileSerializer(OAuthScopeDefinition),
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
						ident: '$.name',
						as: 'id',
						type: 'tag',
						case_sensitive: true,
					},
				)
			},
		})
	}

	async add(...scopes: Scope[]) {
		const keys = scopes.map(e => this.data(e.name))
		await this.transaction({
			watch: keys,
			handler: async (pipe) => {
				for (const [i,v] of scopes.entries()) {
					pipe['json.set'](keys[i], '$', this.serialize(v), 'nx')
				}
			},
		})
	}

	async getAllByIdentifiers(scopeNames: string[]) {
		const key = this.index()
		const res = await this.query(async function (pipe) {
			pipe['ft.search'](
				key,
				`@name:{${scopeNames.map(id => escapeTag(id)).join(' | ')}}`,
			)
		})
		const ret = []
		const v: [string, string][] = Object.values(res[0])
		for (let i=0;i<v.length;i++) ret.push(this.parse(v[i][1]))
		return ret
	}

	async finalize(
		scopes: OAuthScope[],
		_identifier: GrantIdentifier,
		_client: OAuthClient,
		_user_id?: string,
	) {
		if (!_client.allowedGrants.includes(_identifier))
			throw new Error('client request forbidden grant_type')
		if (scopes.some(e => !_client.scopeNames.includes(e.name)))
			throw new Error('client request forbidden scope')
		return scopes
	}
}
