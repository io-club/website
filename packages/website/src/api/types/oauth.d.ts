import type {handleAccessTokenType, Payload} from '~/api/oauth'

import 'fastify'

declare module 'fastify' {
	interface FastifyInstance {
		handleAccessToken: handleAccessTokenType
	}
	interface FastifyRequest {
		access_token?: Payload
	}
}
