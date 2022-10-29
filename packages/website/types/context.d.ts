import type { PrismaClient, User } from '@prisma/client'
import type { SessionStorage } from '@remix-run/server-runtime'
import type { ExecutionResult } from 'graphql'
import type { Authenticator } from 'remix-auth'

export interface Context {
	db: PrismaClient
	sess: SessionStorage
	auth: Authenticator<User>
}

declare module '@remix-run/server-runtime' {
	interface AppLoadContext extends Context {
		graphql: <T extends Record<string, any>>(source: string) => Promise<ExecutionResult<T>>
	}
}

declare module 'fastify' {
	interface FastifyInstance extends Context {
	}
}
