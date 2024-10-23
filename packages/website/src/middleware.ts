import { defineMiddleware } from 'astro:middleware'
import { validateSession } from '@lib/auth'

const cookieName = 'sdfdsf'

export const onRequest = defineMiddleware(async (context, next) => {
	const sessionId = context.cookies.get(cookieName)?.value
	if (!sessionId) {
		context.locals.session = null
		return next()
	}

	context.locals.session = await validateSession(sessionId)
	return next()
})
