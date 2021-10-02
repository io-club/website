import type {Config as authConfig} from './auth'
import type {Options as MailerOptions} from './plugins/mailer'
import type {Config as serviceConfig} from './service'
import type {Configuration as oidcConfig} from 'oidc-provider'

//import FastifySession from '@mgcrea/fastify-session'
//import {SODIUM_SECRETBOX} from '@mgcrea/fastify-session-sodium-crypto'
import {defineNuxtModule} from '@nuxt/kit'
import {load as dotenv} from 'dotenv-extended'
import dotenvVariables from 'dotenv-parse-variables'
import Fastify from 'fastify'
import FastifyCookie from 'fastify-cookie'
import FastifyRedis from 'fastify-redis'
import IORedis from 'ioredis'
import FastifyMiddie from 'middie'
import {Provider} from 'oidc-provider'
import {Client, Issuer} from 'openid-client'

import auth from '@/api/auth'

import RedisAdapter from './oidc/adapter'
import FastifyFetch from './plugins/fetch'
import FastifyMailer from './plugins/mailer'
import FastifySharp from './plugins/sharp'
import service from './service'
import users from './users'

export interface Options {
	url: string
	oidc: Omit<oidcConfig, 'adapter'>
	session: {
		ttl: number
		key: string
	}
	mailer: MailerOptions
	auth: authConfig
	service: serviceConfig
}

export default defineNuxtModule<Options>(function () {
	const _env = dotenv({
		includeProcessEnv: true,
		assignToProcessEnv: false,
	})
	const env = dotenvVariables(_env)

	const url = env['SITE_URL'] as string ?? 'http://localhost:3000'

	const oidc_cookie_keys = env['OIDC_COOKIE_KEYS'] as string[] ?? ['some secret key', 'and also the old rotated away some time ago', 'and one more']
	const oidc_client_id = env['OIDC_CLIENT_ID'] as string ?? 'test'
	const oidc_client_secret = env['OIDC_CLIENT_SECRET'] as string ?? '123456'

	const mailer_host = env['MAILER_HOST'] as string ?? 'x.com' 
	const mailer_port = env['MAILER_PORT'] as string ?? '456' 
	const mailer_user = env['MAILER_USER'] as string ?? 'xx@x.com' 
	const mailer_pass = env['MAILER_PASS'] as string ?? '123456' 

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
			service: {
				image: {
					maxSize: 1000,
					maxAge: Infinity,
				},
			},
		},
		setup: async function (options, nuxt) {
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
				logger: {
					level: 'warn',
				},
			})
				.register(FastifyRedis, {
					client: redis,
					closeClient: true,
				})
				.register(FastifyFetch)
				.register(FastifySharp)
				.register(FastifyCookie)
				/*
				.register(FastifySession, {
					secret: options.session.key,
					crypto: SODIUM_SECRETBOX,
					cookie: {maxAge: options.session.ttl},
				})
				*/
				.register(FastifyMailer, options.mailer)
				.register(FastifyMiddie)

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
			
			app.register(function (app) {
				app
					.register(users, {prefix: '/users', sessionTTL: options.session.ttl, auth: options.auth})
					.register(auth, {prefix: '/auth', ...options.auth})
					.register(service, {prefix: '/service', ...options.service})
					.use('/oidc', oidc.callback)
				return app
			}, {
				logLevel: 'info',
			})

			// wait for initialization
			await app.ready()

			nuxt.options.serverMiddleware.push({
				path: '/api',
				handler: function (req: unknown, res: unknown) {
					app.server.emit('request', req, res);
				},
			})

			// close the server
			nuxt.hook('close', async () => await app.close())
		},
	}
})
