import type { Context as C } from '@/types/context'
import type { FastifyRequest } from 'fastify'

export interface Context extends C {
	req: FastifyRequest
}
