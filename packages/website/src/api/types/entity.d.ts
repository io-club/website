import type {Repositories} from '~/api/entity'

import 'fastify'

declare module 'fastify' {
	interface FastifyInstance {
		entity: Repositories
	}
}
