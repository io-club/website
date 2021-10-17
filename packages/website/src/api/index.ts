import type {Config as authConfig} from './auth'
import type {Config as oauthConfig} from './oauth'
import type {Config as ajvConfig} from './plugins/ajv'
import type {Options as MailerOptions} from './plugins/mailer'
import type {Config as redisConfig} from './plugins/redis'
import type {Config as sessConfig} from './plugins/session'

import Fastify from 'fastify'
import FastifyCookie from 'fastify-cookie'

import {entity} from './entity'
import {oauth} from './oauth'
import FastifyAjv from './plugins/ajv'
import FastifyFetch from './plugins/fetch'
import FastifyMailer from './plugins/mailer'
import FastifyRedis from './plugins/redis'
import FastifySession from './plugins/session'
import FastifySharp from './plugins/sharp'
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
	oauth: Omit<oauthConfig, 'prefix' | 'url'>
}

function createApp() {
	const env = process.env

	const url = env['SITE_URL'] ?? 'http://localhost:3000/api'

	const options: Options = {
		url,
		redis: {
			url: env['REDIS_URL'] ?? 'redis://:@localhost:6379/0',
		},
		session: {
			ttl: 86400,
			key: env['SESSION_KEY'] ?? 'a secret with minimum length of 32 characters',
		},
		mailer: {
			host: env['MAILER_HOST'] ?? 'x.com' ,
			port: parseInt(env['MAILER_PORT'] ?? '456'),
			secure: true,
			auth: {
				user: env['MAILER_USER'] ?? 'xx@x.com',
				pass: env['MAILER_PASS'] ?? '123456',
			}
		},
		auth: {
			TTL: 600,
			mail_from: env['MAILER_USER'] ?? 'xx@x.com',
		},
		ajv: {
		},
		service: {
			image: {
				maxSize: 1000,
				maxAge: Infinity,
				_url: url,
			},
		},
		oauth: {
			jwtSecret: 'ggg',
			root: {
				name: 'root',
				id: env['OAUTH_ROOT_ID'] ?? 'test',
				secret: env['OAUTH_ROOT_SECRET'] ?? '123456',
				allowedGrants: ['client_credentials'],
				redirectUris: [],
				scopeNames: (env['OAUTH_ROOT_SCOPES'] ?? '').split(',').filter(e => e !== ''),
			},
			accessTokenTTL: env['OAUTH_ACCESS_TOKEN_TTL'] ?? '1h',
		},
	}

	// global plugins
	const app = Fastify({
		pluginTimeout: 12000,
		logger: {
			level: 'warn',
		},
		// @ts-expect-error
		jsonShorthand: false,
	})
		.register(FastifyRedis, options.redis)
		.register(FastifyAjv, options.ajv)
		.register(FastifyFetch)
		.register(FastifySharp)
		.register(FastifyCookie)
		.register(FastifySession, options.session)
		.register(FastifyMailer, options.mailer)

	app.register(async function (app) {
		app
			.register(entity, {prefix: '/entity'})
			.register(oauth, {
				...options.oauth,
				url,
				prefix: '/oauth',
			})
			.register(user, {prefix: '/user', url})

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
