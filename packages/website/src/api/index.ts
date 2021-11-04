import type {Config as authConfig} from './auth'
import type {Config as oauthConfig} from './oauth'
import type {Config as ajvConfig} from './plugins/ajv'
import type {Options as MailerOptions} from './plugins/mailer'
import type {Config as redisConfig} from './plugins/redis'
import type {Config as sessConfig} from './plugins/session'

import destr from 'destr'
import Fastify from 'fastify'
import FastifyCookie from 'fastify-cookie'

import {auth} from './auth'
import {entity} from './entity'
import {oauth} from './oauth'
import FastifyAjv from './plugins/ajv'
import FastifyFetch from './plugins/fetch'
import FastifyMailer from './plugins/mailer'
import FastifyRedis from './plugins/redis'
import FastifySession from './plugins/session'
//import service from './service'
import {user} from './user'

export interface Options {
	url: string
	session: sessConfig
	ajv: ajvConfig
	redis: redisConfig
	mailer: MailerOptions
	auth: authConfig
	//service: serviceConfig
	oauth: Omit<oauthConfig, 'prefix' | 'url_api' | 'url_login'>
}

function createApp() {
	const env = process.env

	const url = env['IO_SITE_URL'] ?? 'http://localhost:3000'
	const url_api = new URL(env['IO_API_URL'] ?? '/api', url).toString()
	const url_login = new URL(env['IO_LOGIN_URL'] ?? '/login', url).toString()

	const mail_from = env['IO_MAILER_USER'] ?? 'xx@x.com'

	const options: Options = {
		url,
		redis: {
			url: env['IO_REDIS_URL'] ?? 'redis://:@localhost:6379/0',
		},
		session: {
			cookieName: 'session',
			keys: destr((env['IO_SESSION_KEYS'] ?? '[{"kty":"EC","crv":"P-256","x":"FTbWoF7IDoVuST7MROTj96YdJfCDv22pwWUI3qX3O_4","y":"adf1brnz86vJuwo0PdxzUp6t-s-HWm1jibe5iui56dM","alg":"ECDH-ES+A256KW"},{"kty":"EC","crv":"P-256","x":"FTbWoF7IDoVuST7MROTj96YdJfCDv22pwWUI3qX3O_4","y":"adf1brnz86vJuwo0PdxzUp6t-s-HWm1jibe5iui56dM","d":"oUOaJGdVSOlkQzUUIfDzSdbl1ENRmXIm1Hn1rYTkkyI","alg":"ECDH-ES+A256KW"}]')),
		},
		mailer: {
			host: env['IO_MAILER_HOST'] ?? 'x.com' ,
			port: parseInt(env['IO_MAILER_PORT'] ?? '456'),
			secure: true,
			auth: {
				user: env['IO_MAILER_USER'] ?? 'xx@x.com',
				pass: env['IO_MAILER_PASS'] ?? '123456',
			}
		},
		auth: {
			TTL: 600,
			mail_from,
		},
		ajv: {
		},
		oauth: {
			jwtSecret: 'ggg',
			root: {
				name: 'root',
				id: env['IO_OAUTH_ROOT_ID'] ?? 'root',
				secret: env['IO_OAUTH_ROOT_SECRET'] ?? '123456',
				allowedGrants: ['client_credentials'],
				redirectUris: [],
				scopeNames: (env['IO_OAUTH_ROOT_SCOPES'] ?? '').split(',').filter(e => e !== ''),
			},
			web: {
				name: 'web',
				id: env['IO_OAUTH_WEB_ID'] ?? 'web',
				allowedGrants: ['authorization_code'],
				redirectUris: [url_login],
				scopeNames: [],
			},
			accessTokenTTL: env['IO_OAUTH_ACCESS_TOKEN_TTL'] ?? '1h',
		},
	}

	// global plugins
	const app = Fastify({
		pluginTimeout: 120000,
		logger: {
			level: 'debug',
		},
		// @ts-expect-error
		jsonShorthand: false,
	})
		.register(FastifyRedis, options.redis)
		.register(FastifyAjv, options.ajv)
		.register(FastifyCookie)
		.register(FastifyFetch)
		.register(FastifySession, options.session)
		.register(FastifyMailer, options.mailer)

	app.register(async function (app) {
		app
			.register(entity, {prefix: '/entity'})
			.register(auth, options.auth)
			.register(oauth, {
				...options.oauth,
				prefix: '/oauth',
				url_api,
				url_login,
			})
			.register(user, {
				prefix: '/user',
				url_api,
				mail_from,
			})

		//.register(users, {prefix: '/users', sessionTTL: options.session.ttl, auth: options.auth})
		//.register(auth, {prefix: '/auth', ...options.auth})
		//.register(service, {prefix: '/service', ...options.service})
	}, {
		logLevel: 'info',
	})

	return app
}

const app = createApp()
export default async function (req: unknown, res: unknown) {
	await app.ready()
	app.server.emit('request', req, res)
}
