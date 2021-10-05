import type {JTDDataType} from '~/alias/jtd'
import type {FastifyInstance, FastifyPluginCallback, FastifyRequest} from 'fastify'
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

export interface Config {
	prefix: string 
	jwtSecret: Secret
	accessTokenTTL: string
	root: OAuthClient
}

export interface Context {
	cfg: Config
	app: FastifyInstance
	client: ClientRepository
	code: CodeRepository
	token: TokenRepository
	scope: ScopeRepository
	user: UserRepository
	built_in_scopes: OAuthScope[]
	jwt: JwtService
	authServer: AuthorizationServer

	validateRequest(req: FastifyRequest): Promise<string | JwtPayload | null>
}

export const context: FastifyPluginCallback<Config> = fp(async function (app, options) {
	// setup context
	const ctx: Context = {
		cfg: options,
		app: app,
		jwt: new JwtService(options.jwtSecret),
	} as unknown as Context
	ctx.client = new ClientRepository(ctx)
	ctx.code = new CodeRepository(ctx)
	ctx.token = new TokenRepository(ctx)
	ctx.scope = new ScopeRepository(ctx)
	ctx.user = new UserRepository(ctx)

	// bootstrap
	const redis = await app.redis.acquire()
	try {
		const oauth_bootstrap = join(options.prefix, 'bootstrap')
		await redis.watch(oauth_bootstrap)
		const inited = await redis.exists(oauth_bootstrap)
		if (inited !== 1) {
			let pipe = redis.multi()
			pipe = pipe['ft.create']('json',
				{
					name: ctx.client.index,
					prefix: [ctx.client.data],
				},
				{
					'$.id': ['id', 'tag'],
					'$.allowedGrants[*]': ['grant', 'tag'],
					'$.scopes[*]': ['scope', 'tag'],
				},
			)
			pipe = pipe['ft.create']('json',
				{
					name: ctx.code.index,
					prefix: [ctx.code.data],
				},
				{
					'$.code': ['code', 'tag'],
					'$.client.id': ['client_id', 'tag'],
					'$.user.id': ['user_id', 'tag'],
					'$.scopes[*]': ['scope', 'tag'],
				},
			)
			pipe = pipe['ft.create']('json',
				{
					name: ctx.scope.index,
					prefix: [ctx.scope.data],
				},
				{
					'$.name': ['name', 'tag'],
				},
			)
			pipe = pipe['ft.create']('json',
				{
					name: ctx.token.index,
					prefix: [ctx.token.data],
				},
				{
					'$.accessToken': ['accessToken', 'tag'],
					'$.refreshToken': ['refreshToken', 'tag'],
					'$.client.id': ['client_id', 'tag'],
					'$.user.id': ['user_id', 'tag'],
					'$.scopes[*]': ['scope', 'tag'],
				},
			)
			pipe = pipe['ft.create']('json',
				{
					name: ctx.user.index,
					prefix: [ctx.user.data],
				},
				{
					'$.id': ['id', 'tag'],
				},
			)
			pipe = pipe.set(oauth_bootstrap, 'true')

			const res = await pipe.exec()
			for (const [err,] of res) {
				if (err) throw new Error(`fails to create index ${err}`)
			}
		}
	} finally {
		await redis.unwatch()
		await app.redis.release(redis)
	}

	// it is safe to override these internal scopes
	// add built-in scopes
	ctx.built_in_scopes = [
		{name: join('scope', 'read')},
		{name: join('scope', 'write')},
		{name: join('client', 'read')},
		{name: join('client', 'write')},
		{name: join('user', 'read')},
		{name: join('user', 'write')},
	]
	await ctx.scope.add(...ctx.built_in_scopes)

	// add the super client
	options.root.name = 'root'
	for (const scope of ctx.built_in_scopes) {
		// add built-in scopes if not present
		if (options.root.scopes.every(e => e.name !== scope.name))
			options.root.scopes.push(scope)
	}
	await ctx.client.add(options.root)

	// create the auth server
	ctx.authServer = new AuthorizationServer(
		ctx.code,
		ctx.client,
		ctx.token,
		ctx.scope,
		ctx.user,
		ctx.jwt,
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
		return ctx.jwt.decode(token)
	}

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
			req: {
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
			req: {
				discriminator: 'grant_type',
				mapping: {
					'client_credentials': {
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

	app.route<{ Querystring: JTDDataType<typeof schemas.authorize.req> }>({
		method: 'GET',
		url: '/authorize',
		schema: {
			querystring: schemas.authorize.req,
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
				if (response.status === 302) {
					if (!response.headers.location) throw new Error('missing redirect location');
					res.headers(response.headers);
					res.redirect(response.headers.location);
				} else {
					res.headers(response.headers);
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

	app.route<{ Querystring: JTDDataType<typeof schemas.token.req> }>({
		method: 'POST',
		url: '/token',
		handler: async function (req, res) {
			try {
				const response = await this.oauth.authServer.respondToAccessTokenRequest(
					new OAuthRequest({query: req.query}),
					new OAuthResponse({headers: res.headers}),
				)
				if (response.status === 302) {
					if (!response.headers.location) throw new Error('missing redirect location');
					res.headers(response.headers)
					res.redirect(response.headers.location)
				} else {
					res.headers(response.headers)
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
}
