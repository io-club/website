import 'os'

import type {Config as authConfig} from './auth'
import type {FastifyNodemailerOptions} from 'fastify-nodemailer-plugin'
import type {Configuration as oidcConfig} from 'oidc-provider'

import FastifySession from '@mgcrea/fastify-session'
import {SODIUM_SECRETBOX} from '@mgcrea/fastify-session-sodium-crypto'
import {defineNuxtModule} from '@nuxt/kit'
import Fastify from 'fastify'
import FastifyCookie from 'fastify-cookie'
import FastifyMailer from 'fastify-nodemailer-plugin'
import FastifyRedis from 'fastify-redis'
import IORedis from 'ioredis'
import {Provider} from 'oidc-provider'
import {Client, generators,Issuer} from 'openid-client'

import auth from './auth'
import RedisAdapter from './oidc/adapter'
import users from './users'

export interface Options {
	url: string
	oidc: oidcConfig
	session: {
		ttl: number
		key: string
	},
	mailer: FastifyNodemailerOptions,
	auth: authConfig
}

export default defineNuxtModule<Options>({
	defaults: {
		url: 'http://localhost:3000',
		oidc: {
			adapter: RedisAdapter,
			interactions: {
				url(ctx, interaction) { // eslint-disable-line no-unused-vars
					return `/interaction/${interaction.uid}`;
				},
			},
			claims: {
				address: ['address'],
				email: ['email', 'email_verified'],
				phone: ['phone_number', 'phone_number_verified'],
				profile: ['birthdate', 'family_name', 'gender', 'given_name', 'locale', 'middle_name', 'name',
					'nickname', 'picture', 'preferred_username', 'profile', 'updated_at', 'website', 'zoneinfo'],
			},
			clients: [
				{
					client_id: 'zELcpfANLqY7Oqas',
					client_secret: 'TQV5U29k1gHibH5bx1layBo0OSAvAbRT3UYW3EWrSYBB5swxjVfWUa1BS8lqzxG/0v9wruMcrGadany3',
					scope: 'openid offline_access',
					grant_types: ['authorization_code', 'refresh_token'],
					response_types: ['code'],
					redirect_uris: ['http://localhost:3000/cb'],
				},
			],
			cookies: {
				keys: ['some secret key', 'and also the old rotated away some time ago', 'and one more'],
				short: {
					signed: true,
					httpOnly: true,
					overwrite: true,
					sameSite: 'lax'
				},
				long: {
					signed: true,
					httpOnly: true,
					overwrite: true,
					sameSite: 'none'
				},
			},
			features: {
			},
		},
		session: {
			ttl: 86400,
			key: 'a secret with minimum length of 32 characters',
		},
		mailer: {
			host: 'smtp.163.com',
			port: 465,
			secure: true,
			auth: {
				user: 'iolabot@163.com',
				pass: 'YUZFZYFLTLHSFEMV',
			}
		},
		auth: {
			mailTTL: 600,
		},
	},
	setup: async function (options, nuxt) {
		// redis
		const redis = new IORedis()

		// oidc
		if (options.oidc.adapter instanceof RedisAdapter) {
			RedisAdapter.setRedis(redis)
		}

		const oidc = new Provider(`${options.url}/api/oidc`, options.oidc)
		oidc.proxy = true

		// global plugins
		const app = Fastify({
			logger: true,
		})
			.register(FastifyRedis, {
				client: redis,
				closeClient: true,
			})
			.register(FastifyCookie)
			.register(FastifySession, {
				secret: options.session.key,
				crypto: SODIUM_SECRETBOX,
				cookie: {maxAge: options.session.ttl},
			})
			.register(FastifyMailer, options.mailer)

		let oidcClient: Client
		app.decorate('oidc', async function() {
			if (!oidcClient) {
				const issuer = await Issuer.discover(`${options.url}/api/oidc/`)
				oidcClient = new issuer.Client({
					client_id: 'zELcpfANLqY7Oqas',
					client_secret: 'TQV5U29k1gHibH5bx1layBo0OSAvAbRT3UYW3EWrSYBB5swxjVfWUa1BS8lqzxG/0v9wruMcrGadany3',
					redirect_uris: ['http://localhost:3000/cb'],
					response_types: ['code'],
				})
			}
			return oidcClient
		})
			
		app.register(users, {prefix: '/users', sessionTTL: options.session.ttl, auth: options.auth})
			.register(auth, {prefix: '/auth', ...options.auth})
			.get('/f', async function (req, res) {
				const client = await this.oidc()

				const code_verifier = generators.codeVerifier();
				// store the code_verifier in your framework's session mechanism, if it is a cookie based solution
				// it should be httpOnly (not readable by javascript) and encrypted.

				const code_challenge = generators.codeChallenge(code_verifier);
				const url = client.authorizationUrl({
					scope: 'openid',
					code_challenge,
					code_challenge_method: 'S256',
				});
				console.log(code_verifier, code_challenge, url)
				res.redirect(302, url)
			})

		// wait for initialization
		await app.ready()

		nuxt.options.serverMiddleware.push({
			path: '/api/oidc',
			handler: oidc.callback(),
		},
		{
			path: '/api',
			handler: async function (req: unknown, res: unknown) {
				app.server.emit('request', req, res);
			},
		})

		nuxt.hook('close', async () => await app.close())
	},
})
