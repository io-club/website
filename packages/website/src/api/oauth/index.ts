import type {JTDDataType} from '~/alias/jtd'
import type {FastifyPluginCallback, FastifyRequest} from 'fastify'
import type {JwtPayload, Secret} from 'jsonwebtoken'

import {AuthorizationServer, DateInterval, OAuthClient, OAuthRequest, OAuthResponse, OAuthScope} from '@jmondi/oauth2-server'
import {OAuthException} from '@jmondi/oauth2-server/dist/exceptions/oauth.exception.js'
import fp from 'fastify-plugin'
import {join} from 'pathe'

//import status_code from 'http-status-codes'
import {ClientRepository} from './entity/client'
import {CodeRepository} from './entity/code'
import {ScopeRepository} from './entity/scope'
import {TokenRepository} from './entity/token'
import {UserRepository} from './entity/user'
import {JwtService} from './jwt'
import {routes as userRoutes} from './user'

export interface Config {
	prefix: string 
	accessTokenTTL: string
	jwtSecret: Secret
	root: OAuthClient
}

export interface Context {
	built_in_scopes: OAuthScope[]

	client: ClientRepository
	code: CodeRepository
	token: TokenRepository
	scope: ScopeRepository
	user: UserRepository
	authServer: AuthorizationServer

	validateRequest(req: FastifyRequest): Promise<string | JwtPayload | null>
}

export const context: FastifyPluginCallback<Config> = fp(async function (app, options) {
	// setup context
	const ctx: Context = {} as unknown as Context

	ctx.client = new ClientRepository(app, options)
	ctx.code = new CodeRepository(app, options)
	ctx.token = new TokenRepository(app, options)
	ctx.scope = new ScopeRepository(app, options)
	ctx.user = new UserRepository(app, options)

	const jwt = new JwtService(options.jwtSecret)

	// bootstrap
	const redis = await app.redis.acquire()
	const oauth_bootstrap = join(options.prefix, 'bootstrap')
	try {
		await redis.watch(join(options.prefix, 'lock'))
		const inited = await redis.exists(oauth_bootstrap)
		if (inited !== 1) {
			const pipe = redis.multi()

			pipe['ft.create']('json',
				{
					name: join(options.prefix, 'client', 'index'),
					prefix: [ctx.client.data],
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
					prefix: [ctx.code.data],
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
					prefix: [ctx.token.data],
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
					prefix: [ctx.scope.data],
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
					prefix: [ctx.user.data],
				},
				{
					ident: '$.id',
					as: 'id',
					type: 'tag',
					case_sensitive: true,
				},
			)
			pipe.set(oauth_bootstrap, 'true')

			const res = await pipe.exec()
			for (const [err,] of res) {
				if (err) throw new Error(`fails to create index ${err}`)
			}
		}
	} catch(err) {
		await redis.del(oauth_bootstrap)
		throw err
	} finally {
		await redis.unwatch()
		await app.redis.release(redis)
	}

	// create the auth server
	ctx.authServer = new AuthorizationServer(
		ctx.code,
		ctx.client,
		ctx.token,
		ctx.scope,
		ctx.user,
		jwt,
		{requiresPKCE: true},
	)
	ctx.authServer.enableGrantTypes(
		['client_credentials', new DateInterval(options.accessTokenTTL)],
		['authorization_code', new DateInterval(options.accessTokenTTL)],
		['refresh_token', new DateInterval(options.accessTokenTTL)],
	)

	ctx.validateRequest = async function (req) {
		const token = req.headers.authorization
		if (!token) return null
		const ctx = req.server.oauth
		const revoked = await ctx.token.isRevoked(token)
		if (revoked) return null
		const res =  jwt.decode(token)
		console.log('jwt', res)
		return res
	}

	// it is safe to override these internal scopes
	// add built-in scopes
	ctx.built_in_scopes = [
		{name: 'scope_read'},
		{name: 'scope_write'},
		{name: 'user_read'},
		{name: 'user_write'},
		{name: 'client_read'},
		{name: 'client_write'},
	]
	await ctx.scope.add('create', ...ctx.built_in_scopes)

	// add the super client
	options.root.name = 'root'
	options.root.allowedGrants = ['client_credentials']
	// add built-in scopes if not present
	for (const scope of ctx.built_in_scopes) {
		if (options.root.scopeNames.every(e => e !== scope.name))
			options.root.scopeNames.push(scope.name)
	}
	await ctx.client.add('create', options.root)

	app.decorate('oauth', ctx)
}, {
	name: 'oauth',
	decorators: {
		fastify: ['ajv', 'redis'],
	},
	dependencies: ['redis', 'ajv'],
})

export const routes: FastifyPluginCallback = async function (app) {
	const schemas = {
		authorize: {
			query: {
				properties: {
					response_type: { enum: ['code'] },
					client_id: { type: 'string' },
					redirect_uri: { type: 'string' },
					state: { type: 'string' },
					code_challenge: { type: 'string' },
					code_challenge_method: { enum: ['plain', 'S256'] },
				},
			},
		},
		token: {
			body: {
				discriminator: 'grant_type',
				mapping: {
					'client_credentials': {
						properties: {
							client_id: { type: 'string' },
							client_secret: { type: 'string' },
							scope: { type: 'string' },
						},
					},
					'authorization_code': {
						properties: {
							client_id: { type: 'string' },
							client_secret: { type: 'string' },
							scope: { type: 'string' },
						},
					},
					'refresh_token': {
						properties: {
							client_id: { type: 'string' },
							client_secret: { type: 'string' },
							refresh_token: { type: 'string' },
						},
						optionalProperties: {
							scope: { type: 'string' },
						},
					},
				},
			},
		},
	} as const

	app.route<{ Querystring: JTDDataType<typeof schemas.authorize.query> }>({
		method: 'GET',
		url: '/authorize',
		schema: {
			querystring: schemas.authorize.query,
		},
		handler: async function (req, res) {
			try {
				const authRequest = await this.oauth.authServer.validateAuthorizationRequest(new OAuthRequest({query: req.query}))

				// The auth request object can be serialized and saved into a user's session.
				// You will probably want to redirect the user at this point to a login endpoint.

				// Once the user has logged in set the user on the AuthorizationRequest
				console.log('Once the user has logged in set the user on the AuthorizationRequest')
				authRequest.user = { id: 'abc', email: 'user@example.com' }

				// At this point you should redirect the user to an authorization page.
				// This form will ask the user to approve the client and the scopes requested.

				// Once the user has approved or denied the client update the status
				// (true = approved, false = denied)
				authRequest.isAuthorizationApproved = true

				// Return the HTTP redirect response
				const response = await this.oauth.authServer.completeAuthorizationRequest(authRequest)
				for (const [k,v] of Object.entries(response.headers)) {
					res.header(k, v)
				}
				if (response.status === 302) {
					if (!response.headers.location) throw new Error('missing redirect location');
					res.redirect(response.headers.location);
				} else {
					res.status(response.status).send(response.body);
				}
			} catch (e) {
				if (!(e instanceof OAuthException)) throw e

				res.status(e.status).send({
					status: e.status,
					message: e.message,
				})
			}
		},
	})

	app.route<{ Body: JTDDataType<typeof schemas.token.body> }>({
		method: 'POST',
		url: '/token',
		schema: {
			body: schemas.token.body,
		},
		handler: async function (req, res) {
			try {
				const response = await this.oauth.authServer.respondToAccessTokenRequest(
					new OAuthRequest({body: req.body}),
					new OAuthResponse(),
				)
				for (const [k,v] of Object.entries(response.headers)) {
					res.header(k, v)
				}
				if (response.status === 302) {
					if (!response.headers.location) throw new Error('missing redirect location');
					res.redirect(response.headers.location)
				} else {
					res.status(response.status).send(response.body)
				}
			} catch (e) {
				if (!(e instanceof OAuthException)) throw e

				res.status(e.status).send({
					status: e.status,
					message: e.message,
				})
			}
		},
	})

	app.register(userRoutes, {prefix: '/user'})
}
