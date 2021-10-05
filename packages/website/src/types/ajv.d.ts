import type Ajv from 'ajv'

import 'fastify'

declare module 'fastify' {
	interface FastifyInstance {
		ajv: Ajv 
	}
}
