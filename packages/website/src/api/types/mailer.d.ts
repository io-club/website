import type {Transporter} from 'nodemailer'

import 'fastify'

declare module 'fastify' {
	interface FastifyInstance {
		mailer: Transporter 
	}
}
