import type {FastifyPluginCallback} from 'fastify'

import fp from 'fastify-plugin'
import {join} from 'pathe'

import {ClientRepository} from '~/api/entity/client'
import {CodeRepository} from '~/api/entity/code'
import {ScopeRepository} from '~/api/entity/scope'
import {TokenRepository} from '~/api/entity/token'
import {UserRepository} from '~/api/entity/user'

export interface Repositories {
	user: UserRepository
	client: ClientRepository
	code: CodeRepository
	scope: ScopeRepository
	token: TokenRepository
}

export interface Config {
	prefix: string 
}

export const entity: FastifyPluginCallback<Config> = fp(async function (app, options) {
	// setup context
	const user = new UserRepository(app, options.prefix)
	const client = new ClientRepository(app, options.prefix)
	const code = new CodeRepository(app, options.prefix)
	const token = new TokenRepository(app, options.prefix)
	const scope = new ScopeRepository(app, options.prefix)

	// bootstrap
	const redis = await app.redis.acquire()
	const entity_bootstrap = join(options.prefix, 'bootstrap')
	try {
		await redis.watch(join(options.prefix, 'lock'))
		const inited = await redis.exists(entity_bootstrap)
		if (inited !== 1) {
			const pipe = redis.multi()

			pipe['ft.create']('json',
				{
					name: join(options.prefix, 'client', 'index'),
					prefix: [client.data],
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

			pipe['ft.create']('json',
				{
					name: join(options.prefix, 'code', 'index'),
					prefix: [code.data],
				},
				{
					ident: '$.code',
					as: 'id',
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

			pipe['ft.create']('json',
				{
					name: join(options.prefix, 'token', 'index'),
					prefix: [token.data],
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

			pipe['ft.create']('json',
				{
					name: join(options.prefix, 'scope', 'index'),
					prefix: [scope.data],
				},
				{
					ident: '$.name',
					as: 'id',
					type: 'tag',
					case_sensitive: true,
				},
			)

			pipe['ft.create']('json',
				{
					name: join(options.prefix, 'user', 'index'),
					prefix: [user.data],
				},
				{
					ident: '$.id',
					as: 'id',
					type: 'tag',
					case_sensitive: true,
				},
				{
					ident: '$.email',
					as: 'email',
					type: 'tag',
					case_sensitive: true,
				},
				{
					ident: '$.phone',
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
			pipe.set(entity_bootstrap, 'true')

			const res = await pipe.exec()
			for (const [err,] of res) {
				if (err) throw new Error(`fails to create index ${err}`)
			}
		}
	} catch(err) {
		await redis.del(entity_bootstrap)
		throw err
	} finally {
		await redis.unwatch()
		await app.redis.release(redis)
	}

	const repositories: Repositories = {
		user,
		client,
		code,
		scope,
		token,
	}
	app.decorate('entity', repositories)
}, {
	name: 'entity',
	dependencies: ['ajv', 'redis'],
})

export default entity
