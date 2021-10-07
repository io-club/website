import type Ajv from '~/alias/jtd'

import 'fastify'

declare module 'fastify' {
	interface FastifyInstance {
		ajv: Ajv 
	}
}
