import type {Session} from '~/api/plugins/session'

import 'fastify'

declare module 'fastify' {
	interface FastifyRequest {
		session: Session;
	}
}
