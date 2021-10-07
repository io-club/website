import type {default as fetch} from 'node-fetch'
import type {$Fetch} from 'ohmyfetch'

import 'fastify'

declare module 'fastify' {
	interface FastifyInstance {
		$fetch: $Fetch 
		fetch: typeof fetch 
	}
}
