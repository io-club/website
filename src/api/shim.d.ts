import 'fastify'

import type {Client} from 'openid-client'

declare module 'fastify' {
	interface FastifyInstance {
		oidc: () => Promise<Client>
	}
}
