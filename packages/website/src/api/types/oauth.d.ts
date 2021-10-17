import type {Config, handleAccessTokenType, Payload} from '~/api/oauth'

import 'fastify'

declare module 'fastify' {
	interface FastifyInstance {
		handleAccessToken: handleAccessTokenType
		root: Config['root']
	}
	interface FastifyRequest {
		access_token?: Payload
	}
}
