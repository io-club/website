import type { PrismaClient, User } from '@prisma/client'
import type { SessionStorage } from '@remix-run/server-runtime'
import type { Authenticator } from 'remix-auth'


declare module '@remix-run/server-runtime' {
	interface AppLoadContext {
		db: PrismaClient
		sess: SessionStorage
		auth: Authenticator<User>
	}
}
