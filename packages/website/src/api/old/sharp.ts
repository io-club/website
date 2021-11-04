import type {FastifyPluginCallback} from 'fastify'

import fp from 'fastify-plugin'
import sharp from 'sharp'

const plugin: FastifyPluginCallback = fp(async function (fastify) {
	fastify.decorate('sharp', sharp)
}, {
	name: 'sharp',
})

export default plugin
