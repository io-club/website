import type {JTDDataType} from '~/alias/jtd'
import type {UserRepository} from '~/api/entity/user'
import type {FastifyPluginCallback, FastifyReply, FastifyRequest} from 'fastify'
import type {Secret} from 'jsonwebtoken'
import type {JwtPayload} from 'jsonwebtoken'

import {AuthorizationServer, DateInterval, OAuthClient, OAuthException, OAuthRequest, OAuthResponse, OAuthScope} from '@jmondi/oauth2-server'
import fp from 'fastify-plugin'
import status_code from 'http-status-codes'
import jwt from 'jsonwebtoken'

import {JwtService} from './jwt'

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

export const oauth: FastifyPluginCallback<Config> = fp(async function (app, options) {
	// setup context
	const user = app.entity.user
	const client = app.entity.client
	const code = app.entity.code
	const token = app.entity.token
	const scope = app.entity.scope
	const jwtService = new JwtService(options.jwtSecret)

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
	}, {
		prefix: options.prefix,
		logLevel: 'info',
	})
}, {
	name: 'oauth',
	dependencies: ['ajv', 'redis'],
})

export default oauth
