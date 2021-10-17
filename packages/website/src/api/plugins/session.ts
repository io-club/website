import type {FastifyPluginCallback} from 'fastify'

import FastifySession from '@mgcrea/fastify-session'
import {SODIUM_SECRETBOX} from '@mgcrea/fastify-session-sodium-crypto'
import fp from 'fastify-plugin'

export interface Config {
	ttl: number
	key: string
}

const plugin: FastifyPluginCallback<Config> = fp(async function (app, options) {
	app.register(FastifySession, {
		secret: options.key,
		crypto: SODIUM_SECRETBOX,
		cookie: {maxAge: options.ttl},
	})
}, {
	name: 'session',
})

export default plugin
