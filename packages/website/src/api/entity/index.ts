import type {FastifyPluginCallback} from 'fastify'

import fp from 'fastify-plugin'

import {AuthCodeRepository} from '~/api/entity/auth_code'
import {OAuthClientRepository} from '~/api/entity/oauth_client'
import {OAuthCodeRepository} from '~/api/entity/oauth_code'
import {OAuthScopeRepository} from '~/api/entity/oauth_scope'
import {OAuthTokenRepository} from '~/api/entity/oauth_token'
import {UserRepository} from '~/api/entity/user'

export interface Repositories {
	user: UserRepository
	client: OAuthClientRepository
	code: OAuthCodeRepository
	scope: OAuthScopeRepository
	token: OAuthTokenRepository
	auth_code: AuthCodeRepository
}

export interface Config {
	prefix: string 
}

export const entity: FastifyPluginCallback<Config> = fp(async function (app, options) {
	// setup context
	const scope = await new OAuthScopeRepository(app, options.prefix).init()
	const code = await new OAuthCodeRepository(app, options.prefix).init()
	const token = await new OAuthTokenRepository(app, options.prefix).init()
	const client = await new OAuthClientRepository(app, options.prefix).init()
	const user = await new UserRepository(app, options.prefix).init()
	const auth_code = await new AuthCodeRepository(app, options.prefix).init()

	const repositories: Repositories = {
		user,
		client,
		code,
		scope,
		token,
		auth_code,
	}
	app.decorate('entity', repositories)
}, {
	name: 'entity',
	dependencies: ['ajv', 'redis'],
})

export default entity
