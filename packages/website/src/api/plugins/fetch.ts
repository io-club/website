import type {FastifyPluginCallback} from 'fastify'

import fp from 'fastify-plugin'
import fetch from 'node-fetch'
import {$fetch} from 'ohmyfetch/node'

const plugin: FastifyPluginCallback = fp(async function (fastify) {
	fastify.decorate('$fetch', $fetch)
	fastify.decorate('fetch', fetch)
}, {
	name: 'fetch',
})

export default plugin
