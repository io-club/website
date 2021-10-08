import type {JTDDataType} from '~/alias/jtd'
import type {FastifyPluginCallback, FastifyReply, FastifyRequest} from 'fastify'
import type {Secret} from 'jsonwebtoken'
import type {JwtPayload} from 'jsonwebtoken'

import {AuthorizationServer, DateInterval, OAuthClient, OAuthRequest, OAuthResponse, OAuthScope} from '@jmondi/oauth2-server'
import {OAuthException} from '@jmondi/oauth2-server/dist/exceptions/oauth.exception.js'
import fp from 'fastify-plugin'
import status_code from 'http-status-codes'
import jwt from 'jsonwebtoken'
import {join} from 'pathe'

import {ClientRepository} from '~/api/entity/client'
import {CodeRepository} from '~/api/entity/code'
import {ScopeRepository} from '~/api/entity/scope'
import {TokenRepository} from '~/api/entity/token'
import {UserRepository} from '~/api/entity/user'

import {JwtService} from './jwt'
import {routes as userRoutes} from './user'

export interface Config {
	prefix: string 
	accessTokenTTL: string
	jwtSecret: Secret
	root: OAuthClient
}

type Awaited<T> = T extends PromiseLike<infer U> ? Awaited<U> : T
export interface Payload extends JwtPayload, Awaited<ReturnType<UserRepository['extraAccessTokenFields']>> {
	cid: string
	scope: string
}
export type handleAccessTokenType= (...scope: string[]) => (req: FastifyRequest, res: FastifyReply) => Promise<void>

export const routes: FastifyPluginCallback<Config> = fp(async function (app, options) {
	// setup context
	const client = new ClientRepository(app, options)
	const code = new CodeRepository(app, options)
	const token = new TokenRepository(app, options)
	const scope = new ScopeRepository(app, options)
	const user = new UserRepository(app, options)
	const jwtService = new JwtService(options.jwtSecret)

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
	const authServer = new AuthorizationServer(
		code,
		client,
		token,
		scope,
		user,
		jwtService,
		{requiresPKCE: true},
	)
	authServer.enableGrantTypes(
		['client_credentials', new DateInterval(options.accessTokenTTL)],
		['authorization_code', new DateInterval(options.accessTokenTTL)],
		['refresh_token', new DateInterval(options.accessTokenTTL)],
	)

	// it is safe to override these internal scopes
	// add built-in scopes
	const built_in_scopes: OAuthScope[] = [
		{name: 'scope_read'},
		{name: 'scope_write'},
		{name: 'user_read'},
		{name: 'user_write'},
		{name: 'client_read'},
		{name: 'client_write'},
	]
	await scope.add('create', ...built_in_scopes)

	// add the super client
	options.root.name = 'root'
	options.root.allowedGrants = ['client_credentials']
	// add built-in scopes if not present
	for (const scope of built_in_scopes) {
		if (options.root.scopeNames.every(e => e !== scope.name))
			options.root.scopeNames.push(scope.name)
	}
	await client.add('create', options.root)

	// validate function
	const handleAccessToken: handleAccessTokenType = function (scopes) {
		return async function (req, res) {
			let authorization = req.headers.authorization
			if (!authorization) {
				res.status(status_code.UNAUTHORIZED).send('need authorization header')
				return
			}
			authorization = authorization.trim()
			if (!authorization.startsWith('Bearer')) {
				res.status(status_code.UNAUTHORIZED).send('invalid authorization header')
				return
			}
			const payload = jwt.decode(
				authorization.substring(6).trimLeft(),
				{
					json: true,
				},
			) as Payload
			if (!payload) {
				res.status(status_code.UNAUTHORIZED).send('invalid bearer token format')
				return
			}
			if (!payload.jti) {
				res.status(status_code.UNAUTHORIZED).send('need an access token')
				return
			}
			const revoked = await token.isRevoked(payload.jti)
			if (revoked) {
				res.status(status_code.UNAUTHORIZED).send('revoked token')
				return
			}
			for (const scope of scopes) {
				if (!payload.scope.split(' ').includes(scope)) {
					res.status(status_code.FORBIDDEN).send('invalid scope')
					return
				}
			}
			req.access_token = payload
		}
	}

	app.decorate('handleAccessToken', handleAccessToken)
	app.decorateRequest('access_token', undefined)

	// setup routes
	app.register(async function (app) {
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
					const authRequest = await authServer.validateAuthorizationRequest(new OAuthRequest({query: req.query}))

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
					const response = await authServer.completeAuthorizationRequest(authRequest)
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
					const response = await authServer.respondToAccessTokenRequest(
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

		app.register(userRoutes, {
			prefix: '/user',
			user,
		})
	}, {
		prefix: options.prefix,
		logLevel: 'info',
	})
}, {
	name: 'oauth',
	dependencies: ['ajv', 'redis'],
})

export default routes
