import type {Client} from 'openid-client'

import 'fastify'

declare module 'fastify' {
	interface FastifyInstance {
		oidc: () => Promise<Client>
	}
}
