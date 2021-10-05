import type {Context} from '~/api/oauth'

import 'fastify'

declare module 'fastify' {
	interface FastifyInstance {
		oauth: Context
	}
	interface FastifyRequest {
	}
}
