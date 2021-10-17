import type {Auth} from '~/api/auth'

import 'fastify'

declare module 'fastify' {
	interface FastifyInstance {
		auth: Auth
	}
}
