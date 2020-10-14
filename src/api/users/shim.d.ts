import '@mgcrea/fastify-session'

declare module '@mgcrea/fastify-session' {
	interface SessionData {
		uid?: string
	}
}
