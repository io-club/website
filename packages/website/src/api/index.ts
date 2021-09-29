import type {Config as authConfig} from './auth'
import type {FastifyNodemailerOptions} from 'fastify-nodemailer-plugin'
import type {Configuration as oidcConfig} from 'oidc-provider'

import FastifySession from '@mgcrea/fastify-session'
import {SODIUM_SECRETBOX} from '@mgcrea/fastify-session-sodium-crypto'
import {defineNuxtModule} from '@nuxt/kit'
import {load as dotenv} from 'dotenv-extended'
import dotenvVariables from 'dotenv-parse-variables'
import Fastify from 'fastify'
import FastifyCookie from 'fastify-cookie'
import FastifyMailer from 'fastify-nodemailer-plugin'
import FastifyRedis from 'fastify-redis'
import IORedis from 'ioredis'
import {Provider} from 'oidc-provider'
import {Client, Issuer} from 'openid-client'

import auth from './auth'
import RedisAdapter from './oidc/adapter'
import users from './users'

export interface Options {
	url: string
	oidc: Omit<oidcConfig, 'adapter'>
	session: {
		ttl: number
		key: string
	},
	mailer: FastifyNodemailerOptions,
	auth: authConfig
}

export default defineNuxtModule<Options>(function () {
	const _env = dotenv({
		includeProcessEnv: true,
		assignToProcessEnv: false,
	})
	const env = dotenvVariables(_env)

	const url = env['SITE_URL'] ?? 'http://localhost:3000'

	const oidc_cookie_keys = env['OIDC_COOKIE_KEYS'] ?? ['some secret key', 'and also the old rotated away some time ago', 'and one more']
	const oidc_client_id = env['OIDC_CLIENT_ID'] ?? 'test'
	const oidc_client_secret = env['OIDC_CLIENT_SECRET'] ?? '123456'

	const mailer_host = env['MAILER_HOST'] ?? 'x.com' 
	const mailer_port = env['MAILER_PORT'] ?? '456' 
	const mailer_user = env['MAILER_USER'] ?? 'xx@x.com' 
	const mailer_pass = env['MAILER_PASS'] ?? '123456' 

	return {
		defaults: {
			url,
			oidc: {
				claims: {
					email: ['email', 'email_verified'],
					phone: ['phone_number', 'phone_number_verified'],
					profile: ['birthdate', 'family_name', 'gender', 'given_name', 'locale', 'middle_name', 'name',
						'nickname', 'picture', 'preferred_username', 'profile', 'updated_at', 'website', 'zoneinfo'],
				},
				clients: [
					{
						client_id: oidc_client_id,
						client_secret: oidc_client_secret,
						scope: 'openid offline_access',
						grant_types: ['authorization_code', 'refresh_token'],
					},
				],
				cookies: {
					keys: oidc_cookie_keys,
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
				host: mailer_host,
				port: mailer_port,
				secure: true,
				auth: {
					user: mailer_user,
					pass: mailer_pass,
				}
			},
			auth: {
				mailTTL: 600,
			},
		},
		setup: async function (options, nuxt) {
			console.log(options)

			// redis
			const redis = new IORedis()

			// oidc
			RedisAdapter.setRedis(redis)
			const oidc = new Provider(`${options.url}/api/oidc`, {
				...options.oidc,
				adapter: RedisAdapter,
			})
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
						client_id: oidc_client_id,
						client_secret: oidc_client_secret,
						redirect_uris: [`${url}/cb`],
						response_types: ['code'],
					})
				}
				return oidcClient
			})
			
			app.register(users, {prefix: '/users', sessionTTL: options.session.ttl, auth: options.auth})
				.register(auth, {prefix: '/auth', ...options.auth})

			// wait for initialization
			await app.ready()

			nuxt.options.serverMiddleware.push(
				{
					path: '/api/oidc',
					handler: oidc.callback(),
				},
				{
					path: '/api',
					handler: async function (req: unknown, res: unknown) {
						app.server.emit('request', req, res);
					},
				}
			)

			// close the server
			nuxt.hook('close', async () => await app.close())
		},
	}
})
