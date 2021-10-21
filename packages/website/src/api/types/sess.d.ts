import type { User } from '~/api/entity/user';

import '@mgcrea/fastify-session'

declare module '@mgcrea/fastify-session' {
	interface SessionData {
		user?: User
	}
}
